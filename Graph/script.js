let scale = 1;
let panX = 0;
let panY = 0;
const zoomSensitivity = 0.1;
let isPanning = false;
let startX, startY;

// Create a container to hold both boxes and lines
const container = document.createElement('div');
container.style.position = 'relative';
container.style.transformOrigin = '0 0';
container.style.width = '100%';
container.style.height = '100%';
document.body.appendChild(container);

// Function to apply transformations for zoom and pan
function applyTransformations() {
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;

    // After transformations, update all lines between boxes
    connections.forEach(connection => {
        createOrUpdateCurvedLink(connection.box1, connection.box2, connection.path);
    });
}

// Zoom in/out function
function zoom(delta) {
    const zoomFactor = delta > 0 ? 1 + zoomSensitivity : 1 - zoomSensitivity;
    const newScale = scale * zoomFactor * 0.1;

    // Prevent zooming out too much
    if (newScale >= 0.2 && newScale <= 3) {
        scale = newScale;
        applyTransformations();
    }
}

// Function to handle panning the canvas
function enablePanning() {
    document.addEventListener('mousedown', function (e) {
        if (e.target === document.body || e.target.tagName === 'svg') {
            isPanning = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            document.body.style.cursor = 'grab';
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (isPanning) {
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            applyTransformations();
        }
    });

    document.addEventListener('mouseup', function () {
        isPanning = false;
        document.body.style.cursor = 'default';
    });
}

// Event listener for zooming using the mouse wheel
document.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoom(e.deltaY);
});

// Function to create and update the curved link between two boxes
function createOrUpdateCurvedLink(box1, box2, path) {
    const box1Rect = box1.getBoundingClientRect();
    const box2Rect = box2.getBoundingClientRect();

    // Calculate center points
    const box1CenterX = box1Rect.left + box1Rect.width / 2;
    const box1CenterY = box1Rect.top + box1Rect.height / 2;
    const box2CenterX = box2Rect.left + box2Rect.width / 2;
    const box2CenterY = box2Rect.top + box2Rect.height / 2;

    // Calculate control point for the curve
    const controlPointX = (box1CenterX + box2CenterX) / 2;
    const controlPointY = Math.min(box1CenterY, box2CenterY) + 300;

    // Set new path data
    const pathData = `M ${box1CenterX} ${box1CenterY} Q ${controlPointX} ${controlPointY}, ${box2CenterX} ${box2CenterY}`;
    path.setAttribute("d", pathData);
}

// Function to make an element draggable and update all connected lines
function makeDraggable(box, connections) {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;

    box.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const boxRect = box.getBoundingClientRect();
        // Offset is calculated relative to where the user clicked on the box
        offsetX = startX - boxRect.left;
        offsetY = startY - boxRect.top;
        box.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Calculate the new position of the box based on the initial click offset
            box.style.left = `${mouseX - offsetX}px`;
            box.style.top = `${mouseY - offsetY}px`;

            // Update all lines connected to this box
            connections.forEach(connection => {
                createOrUpdateCurvedLink(connection.box1, connection.box2, connection.path);
            });
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
        box.style.cursor = 'grab';
    });
}


// Function to dynamically create a box
function createBox(color, top, left) {
    const box = document.createElement('div');
    box.classList.add('box');
    box.style.backgroundColor = color;
    box.style.top = `${top}%`;
    box.style.left = `${left}%`;
    box.style.position = 'absolute';  // Set position relative to the container
    box.style.width = '100px';
    box.style.height = '100px';
    box.style.cursor = 'grab';

    container.appendChild(box);  // Append to the container
    return box;  // Return the created box for later use
}

// Function to create a line between two boxes
function createConnection(box1, box2) {
    const svg = document.getElementById('lineContainer');
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // Initial line between the two boxes
    createOrUpdateCurvedLink(box1, box2, path);

    // Return an object that contains the boxes and the path
    return { box1, box2, path };
}

// Main logic
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = 'lineContainer';
svg.style.position = 'absolute';
svg.style.top = '0';
svg.style.left = '0';
svg.style.width = '100%';
svg.style.height = '100%';
container.appendChild(svg);  // Append the svg to the container

const connections = []; // Store all connections

// Create some initial boxes
const box1 = createBox('red', 20, 30);
const box2 = createBox('green', 60, 50);
const box3 = createBox('blue', 40, 70); // Another box for testing

// Create connections between boxes
connections.push(createConnection(box1, box2));
connections.push(createConnection(box1, box3));

// Collect unique boxes from connections and make each one draggable
const uniqueBoxes = new Set();
connections.forEach(connection => {
    uniqueBoxes.add(connection.box1);
    uniqueBoxes.add(connection.box2);
});

uniqueBoxes.forEach(box => {
    const relatedConnections = connections.filter(c => c.box1 === box || c.box2 === box);
    makeDraggable(box, relatedConnections);
});

// Enable canvas panning
enablePanning();
// Function to handle box clicks and add two new boxes linked to the clicked box
function addNewBoxesOnClick(box) {
    box.addEventListener('dblclick', function () {
        const boxRect = box.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate positions for the new boxes
        const newBox1Top = (boxRect.top - containerRect.top + 150) / containerRect.height * 100;
        const newBox1Left = (boxRect.left - containerRect.left + 150) / containerRect.width * 100;

        const newBox2Top = (boxRect.top - containerRect.top + 300) / containerRect.height * 100;
        const newBox2Left = (boxRect.left - containerRect.left + 300) / containerRect.width * 100;

        // Create two new boxes
        const newBox1 = createBox('purple', newBox1Top, newBox1Left);
        const newBox2 = createBox('orange', newBox2Top, newBox2Left);

        // Create connections between the clicked box and the new boxes
        const connection1 = createConnection(box, newBox1);
        const connection2 = createConnection(box, newBox2);

        // Add new connections to the connection array
        connections.push(connection1);
        connections.push(connection2);

        // Update the clicked box's draggable functionality to account for the new connections
        const updatedConnections = connections.filter(c => c.box1 === box || c.box2 === box);
        makeDraggable(box, updatedConnections);  // Re-apply dragging with new connections

        // Make the new boxes draggable
        makeDraggable(newBox1, connections.filter(c => c.box1 === newBox1 || c.box2 === newBox1));
        makeDraggable(newBox2, connections.filter(c => c.box1 === newBox2 || c.box2 === newBox2));

        // Add click event to the new boxes so they can also generate more boxes
        addNewBoxesOnClick(newBox1);
        addNewBoxesOnClick(newBox2);
    });
}

// Apply the click functionality and draggable functionality to all initial boxes
uniqueBoxes.forEach(box => {
    addNewBoxesOnClick(box);
    const relatedConnections = connections.filter(c => c.box1 === box || c.box2 === box);
    makeDraggable(box, relatedConnections);  // Ensure existing boxes are draggable as well
});
