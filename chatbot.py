import csv

from flask import Flask, request, jsonify, render_template
import webbrowser
from transformers import (pipeline, AutoModelForSequenceClassification, BartForSequenceClassification, BartTokenizer)
from sentence_transformers import SentenceTransformer


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

model_name = "my_fine_tuned_bart_base1"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForSequenceClassification.from_pretrained(model_name)

classifier = pipeline('text-classification', model=model, tokenizer=tokenizer)

labels = ['Access', 'Consulting', 'Database', 'Development', 'Email', 'Hardware',
              'Network', 'Network\\security', 'Printer', 'SAP', 'Security', 'Software',
              'Support', 'Training', 'VPN', 'Website']

label_map = {f"LABEL_{i}": label for i, label in enumerate(labels)}

#================
model_name = "sentence"
model = SentenceTransformer(model_name)

f = open('dataset.csv')
a = csv.reader(f, delimiter=";")
sentences1 = []
for i in a:
    sentences1.append(i[0])


@app.route('/add_message', methods=['POST'])
def add_message():
    data = request.json
    input_string = data.get('message', '')

    predictions = classifier(input_string)

    m = max(predictions, key=lambda x: x['score'])

    real_label = label_map.get(m['label'], m['label'])


    result_string = real_label

    return jsonify({"result": result_string})



@app.route('/add_similar', methods=['POST'])
def add_similar():
    data = request.json
    input_string = data.get('message', '')

    embeddings1 = model.encode(sentences1)
    embeddings2 = model.encode(input_string)
    similarities = model.similarity(embeddings1, embeddings2)

    result_string = "Обращение номер " + str(list(similarities).index(max(similarities))) + ": " + sentences1[list(similarities).index(max(similarities))] + f"; Процент совпадения: {float(max(similarities))*100:.2f}%"

    return jsonify({"result": result_string})



if __name__ == '__main__':
    webbrowser.open('http://127.0.0.1:5000/')
    app.run(port=5000)
