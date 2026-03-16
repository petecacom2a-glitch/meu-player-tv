import http.server
import socketserver
import socket

PORT = 9000
Handler = http.server.SimpleHTTPRequestHandler

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # não precisa ser alcançável
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class MyTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with MyTCPServer(("", PORT), Handler) as httpd:
    ip_addr = get_ip()
    print(f"Servidor iniciado em:")
    print(f"Local:   http://localhost:{PORT}")
    print(f"Na TV:    http://{ip_addr}:{PORT}")
    print("\nPressione Ctrl+C para parar o servidor.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")
