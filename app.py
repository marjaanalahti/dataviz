from flask import Flask, request, jsonify, send_file, render_template, send_from_directory
from flask_cors import CORS

app = Flask(__name__,static_folder='app/static', template_folder='app/templates')
CORS(app)

@app.route("/")
def home():
    return render_template("index.html") 

#@app.route("/average_rating")
#def average_rating():
#    return render_template("average_rating.html")

#@app.route("/fastest_time")
#def fastest_time():
#    return render_template("fastest_time.html")


@app.route("/theme1")
def theme1():
    return render_template("page1.html")

@app.route("/theme2")
def theme2():
    return render_template("page2.html")

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)
