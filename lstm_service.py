"""Local HTTP wrapper for the RevRakshak LSTM gate.

It uses only the Python standard library around ``lstm_autoencoder.py`` and
never calls Razorpay or any external service.
"""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from lstm_autoencoder import PaymentSequenceGate

gate = PaymentSequenceGate()


class Handler(BaseHTTPRequestHandler):
    def _write(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self._write(200, {"status": "ok", "model": "LSTM autoencoder with velocity fallback"})
            return
        self._write(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/predict":
            self._write(404, {"error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length))
            result = gate.predict(payload.get("events", []))
            self._write(200, result.__dict__)
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            self._write(400, {"error": str(error)})


if __name__ == "__main__":
    port = int(os.getenv("LSTM_PORT", "8010"))
    print(f"RevRakshak LSTM service listening on http://127.0.0.1:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()