import http.server
import socketserver
import webbrowser
import os
import sys

# Define the port
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Silence logs to keep console clean
        pass

print(f"Starting Local Server for PGR Card Creator...")
print(f"Serving directory: {DIRECTORY}")
print(f"Open your browser at: http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

# Open browser automatically
webbrowser.open(f"http://localhost:{PORT}")

# Start Server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
