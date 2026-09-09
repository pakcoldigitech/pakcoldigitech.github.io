import random

responses = ["Yes", "No", "Unclear at this time.", "Never!", "Of course!"]

while True:
    input("Ask me a question: ")

    print( random.choice(responses) )

