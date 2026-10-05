import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
try:
    os.chdir(BASE_DIR)
except Exception:
    pass

try:
    from main import wsgi_app as _wsgi_app

    def application(environ, start_response):
        # Extract environment variables set by LiteSpeed SetEnv from the request dictionary
        for key, val in environ.items():
            if isinstance(val, str):
                os.environ[key] = val
        return _wsgi_app(environ, start_response)
except Exception as e:
    import traceback
    # Write the error to a file in the app directory for easy debugging
    error_path = os.path.join(BASE_DIR, "error.txt")
    with open(error_path, "w", encoding="utf-8") as f:
        f.write("Python Startup Error Traceback:\n")
        f.write(traceback.format_exc())
    raise e
