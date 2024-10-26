document.addEventListener("DOMContentLoaded", function() {
    const inputElement = document.querySelector('.input-container .input-input textarea');
    const sendButton = document.querySelector('.input-container .send-button');
    const chatContainer = document.querySelector('.chat-container');
    let previousUserMessage = '';
    let isSimilarMessageRequest = false; 

    function sendMessage(isUserMessage, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(isUserMessage ? 'user-message' : 'bot-message', 'message');

        const messageParagraph = document.createElement('p');
        if (isUserMessage && isSimilarMessageRequest) {
            messageParagraph.textContent = "Показать похожие"; 
        } else {
            messageParagraph.textContent = text;
        }
        messageElement.appendChild(messageParagraph);

        const tailClass = isUserMessage ? 'tail' : 'tail-left';
        const tailElement = document.createElement('div');
        tailElement.classList.add(tailClass);
        messageElement.appendChild(tailElement);

        
        chatContainer.appendChild(messageElement);

        
        if (!isUserMessage && !isSimilarMessageRequest) {
            const similarMessageElement = document.createElement('div');
            similarMessageElement.classList.add('message', 'similar');
            similarMessageElement.textContent = "Показать похожие";

            similarMessageElement.addEventListener('click', function() {
                if (!similarMessageElement.classList.contains('similar-pressed')) {
                    similarMessageElement.classList.add('similar-pressed');
                    sendSimilarMessage(previousUserMessage); 
                }
            });

            
            chatContainer.appendChild(similarMessageElement);
        }

        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        
        if (!isUserMessage) {
            isSimilarMessageRequest = false; 
        }
    }

    function sendUserMessage(message) {
        const similarElements = chatContainer.querySelectorAll('.similar');
        similarElements.forEach(el => {
            el.remove(); 
        });

        sendMessage(true, message);
        previousUserMessage = message; 

        fetch('http://127.0.0.1:5000/add_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            const receivedString = data.result;
            sendMessage(false, receivedString); 
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function sendSimilarMessage(message) {
        isSimilarMessageRequest = true; 
        sendMessage(true, message);

        fetch('http://127.0.0.1:5000/add_similar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            const receivedString = data.result;
            sendMessage(false, receivedString); 
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    sendButton.addEventListener('click', function() {
        const message = inputElement.value.trim();
        if (message === "") return;

        sendUserMessage(message);

        
        inputElement.value = '';
        inputElement.focus();
    });

    inputElement.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const message = inputElement.value.trim();
            if (message === "") return;

            sendUserMessage(message);

            
            inputElement.value = '';
        }
    });
});
