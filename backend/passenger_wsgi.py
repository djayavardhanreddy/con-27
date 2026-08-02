import sys
import os

# Add the current directory to python path
sys.path.insert(0, os.path.dirname(__file__))

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
    with open("error.txt", "w") as f:
        f.write("Python Startup Error Traceback:\n")
        f.write(traceback.format_exc())
    raise e
