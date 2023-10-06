document.addEventListener('DOMContentLoaded', () => {
    // Display current date with abbreviated month
    const currentDateElement = document.getElementById('currentDate');
    const currentDate = dayjs().format('MMM D, YYYY');
    currentDateElement.textContent = currentDate;

    // Generate time blocks for the entire day (24 hours)
    const timeBlocksContainer = document.querySelector('.time-blocks');
    const currentHour = dayjs().hour();

    for (let hour = 0; hour < 24; hour++) {
        const timeBlock = document.createElement('div');
        timeBlock.className = 'time-block';

        // Determine the current hour's class for styling
        const currentHourClass = currentHour === hour ? 'current-hour' : (currentHour > hour ? 'past-hour' : 'future-hour');
        timeBlock.classList.add(currentHourClass);

        // Display the hour
        const hourElement = document.createElement('p');
        hourElement.className = 'hour-label';
        hourElement.textContent = dayjs().hour(hour).format('h A');

        // Create input for event or display existing events
        const inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.placeholder = 'Add event';
        const savedEvents = JSON.parse(localStorage.getItem(`events-${hour}`) || '[]');

        if (savedEvents.length > 0) {
            // Display existing events
            inputField.value = savedEvents.map(event => event.text).join('\n');
            // Add a class to indicate a time block with events
            timeBlock.classList.add('has-event');
        }

        // Add a button to create a new event in this time slot
        const createEventButton = document.createElement('button');
        createEventButton.textContent = 'Create Event';
        createEventButton.addEventListener('click', () => {
            const eventText = inputField.value;
            if (eventText) {
                const events = JSON.parse(localStorage.getItem(`events-${hour}`) || '[]');
                const newEvent = { id: Date.now(), text: eventText };
                events.push(newEvent);
                localStorage.setItem(`events-${hour}`, JSON.stringify(events));
                inputField.value = ''; // Clear the input field
                updateUpcomingEventsList(); // Update the upcoming events list
            }
        });

        timeBlock.appendChild(hourElement);
        timeBlock.appendChild(inputField);
        timeBlock.appendChild(createEventButton);
        timeBlocksContainer.appendChild(timeBlock);
    }

    // Function to update the upcoming events list
    function updateUpcomingEventsList() {
        const upcomingEventsList = document.getElementById('upcomingEventsList');
        upcomingEventsList.innerHTML = ''; // Clear the list

        // Iterate through the next 6 hours to display events
        for (let i = currentHour; i < currentHour + 6; i++) {
            const savedEvents = JSON.parse(localStorage.getItem(`events-${i}`) || '[]');
            savedEvents.forEach(event => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${dayjs().hour(i).format('h A')}: </span>
                    <span class="event-text">${event.text}</span>
                    <button class="edit-event">Edit</button>
                    <button class="delete-event" data-id="${event.id}">Delete</button>
                `;

                const editButton = listItem.querySelector('.edit-event');
                const deleteButton = listItem.querySelector('.delete-event');

                editButton.addEventListener('click', () => {
                    const newText = prompt('Edit the event:', event.text);
                    if (newText !== null) {
                        event.text = newText;
                        localStorage.setItem(`events-${i}`, JSON.stringify(savedEvents));
                        updateUpcomingEventsList();
                    }
                });

                deleteButton.addEventListener('click', () => {
                    const confirmation = confirm('Are you sure you want to delete this event?');
                    if (confirmation) {
                        const index = savedEvents.findIndex(e => e.id === event.id);
                        if (index !== -1) {
                            savedEvents.splice(index, 1);
                            localStorage.setItem(`events-${i}`, JSON.stringify(savedEvents));
                            updateUpcomingEventsList();
                        }
                    }
                });

                upcomingEventsList.appendChild(listItem);
            });
        }
    }

    // Initial update of the upcoming events list
    updateUpcomingEventsList();
});
