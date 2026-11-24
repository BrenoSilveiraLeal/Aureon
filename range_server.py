#!/usr/bin/env python3
"""Serve this static site locally with HTTP byte-range support for video seeking."""

from __future__ import annotations

import argparse
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


class RangeRequestHandler(SimpleHTTPRequestHandler):
    def _serve_file(self, send_body: bool) -> None:
        path = self.translate_path(urlsplit(self.path).path)
        if os.path.isdir(path):
            if send_body:
                super().do_GET()
            else:
                super().do_HEAD()
            return

        try:
            file = open(path, "rb")
            size = os.fstat(file.fileno()).st_size
        except OSError:
            self.send_error(404, "File not found")
            return

        start, end = 0, size - 1
        header = self.headers.get("Range")
        status = 200
        if header:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", header.strip())
            if not match or size == 0:
                file.close()
                self.send_error(416, "Invalid byte range", headers={"Content-Range": f"bytes */{size}"})
                return
            first, last = match.groups()
            if first:
                start = int(first)
                end = min(int(last), size - 1) if last else size - 1
            elif last:
                suffix = int(last)
                start, end = max(0, size - suffix), size - 1
            else:
                file.close()
                self.send_error(416, "Invalid byte range", headers={"Content-Range": f"bytes */{size}"})
                return
            if start >= size or end < start:
                file.close()
                self.send_error(416, "Invalid byte range", headers={"Content-Range": f"bytes */{size}"})
                return
            status = 206

        length = end - start + 1
        self.send_response(status)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        if path.lower().endswith((".html", ".css", ".js")):
            self.send_header("Last-Modified", self.date_time_string(os.path.getmtime(path)))
            self.send_header("Cache-Control", "no-cache")
        if status == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()

        if send_body:
            file.seek(start)
            remaining = length
            with file:
                while remaining:
                    chunk = file.read(min(64 * 1024, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
        else:
            file.close()

    def do_GET(self) -> None:
        self._serve_file(send_body=True)

    def do_HEAD(self) -> None:
        self._serve_file(send_body=False)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=13000)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), lambda *a, **kw: RangeRequestHandler(*a, directory=os.getcwd(), **kw))
    print(f"Serving {os.getcwd()} at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
