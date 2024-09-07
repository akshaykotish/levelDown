let scale = 1;
let panX = 0;
let panY = 0;
const zoomSensitivity = 0.01;
let isPanning = false;
let startX, startY;
let boxHierarchy = new Map(); // To track each box and its sub-boxes

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
function zoom(delta, event) {
    const zoomFactor = delta > 0 ? 1 + zoomSensitivity : 1 - zoomSensitivity;
    const newScale = scale * zoomFactor;

    // Prevent zooming out too much
    if (newScale >= 0.2 && newScale <= 3) {
        // Adjust pan to ensure zoom is centered at the cursor location
        const containerRect = container.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        // Compute pan adjustment
        panX = mouseX - ((mouseX - panX) / scale) * newScale;
        panY = mouseY - ((mouseY - panY) / scale) * newScale;

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
    zoom(e.deltaY, e);
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

// Function to create a line between two boxes
function createConnection(box1, box2, color = 'black') {
    const svg = document.getElementById('lineContainer');
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // Initial line between the two boxes
    createOrUpdateCurvedLink(box1, box2, path);

    // Return an object that contains the boxes, the path, and its color
    return { box1, box2, path, color };
}

// Function to dynamically create a box with correct positioning based on container size
function createBox(color, top, left) {
    const box = document.createElement('div');
    box.classList.add('box');
    box.style.backgroundColor = color;
    box.style.top = `${top}px`;  
    box.style.left = `${left}px`; 
    box.style.position = 'absolute';  
    box.style.width = '100px';
    box.style.height = '100px';
    box.style.cursor = 'grab';

    container.appendChild(box);  
    return box;  
}

// Function to allow line color change
function enableLineColorChange(path) {
    path.addEventListener('contextmenu', function (e) {
        e.preventDefault(); 
        const newColor = prompt("Enter a new color for the line (e.g., red, #FF0000):", path.getAttribute("stroke"));
        if (newColor) {
            path.setAttribute("stroke", newColor);

            // Update the color in the connection object
            connections.forEach(connection => {
                if (connection.path === path) {
                    connection.color = newColor;
                }
            });
        }
    });
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
        offsetX = (startX - boxRect.left);
        offsetY = (startY - boxRect.top);
        box.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const newLeft = (mouseX - offsetX - panX) / scale;
            const newTop = (mouseY - offsetY - panY) / scale;

            box.style.left = `${newLeft}px`;
            box.style.top = `${newTop}px`;

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

// Recursive hide/show functions for sub-boxes
function hideSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'none';
            subBox.connection1.path.style.display = 'none';
            subBox.connection2.path.style.display = 'none';
            hideSubBoxes(subBox.element); // Recursive call to hide sub-boxes
        });
    }
}

function showSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'block';
            subBox.connection1.path.style.display = 'block';
            subBox.connection2.path.style.display = 'block';
            showSubBoxes(subBox.element); // Recursive call to show sub-boxes
        });
    }
}

// Function to add new boxes on double-click
function addNewBoxesOnClick(box) {
    box.addEventListener('dblclick', function () {
        if (boxHierarchy.has(box)) {
            const subBoxes = boxHierarchy.get(box);
            if (subBoxes && subBoxes[0].element.style.display === 'none') {
                showSubBoxes(box);
            } else {
                hideSubBoxes(box);
            }
            return;
        }

        const boxRect = box.getBoundingClientRect();

        const newBox1Top = boxRect.top + boxRect.height + 120 - panY;
        const newBox1Left = boxRect.left - boxRect.width - 120 - panX;
        const newBox2Top = boxRect.top + boxRect.height + 120 - panY;
        const newBox2Left = boxRect.left + boxRect.width - panX;

        const newBox1 = createBox('purple', newBox1Top, newBox1Left);
        const newBox2 = createBox('orange', newBox2Top, newBox2Left);

        const parentConnection = connections.find(connection => connection.box1 === box || connection.box2 === box);
        const parentColor = parentConnection ? parentConnection.color : 'black';

        const connection1 = createConnection(box, newBox1, parentColor);
        const connection2 = createConnection(box, newBox2, parentColor);

        connections.push(connection1);
        connections.push(connection2);

        const updatedConnections = connections.filter(c => c.box1 === box || c.box2 === box);
        makeDraggable(box, updatedConnections);  

        makeDraggable(newBox1, connections.filter(c => c.box1 === newBox1 || c.box2 === newBox1));
        makeDraggable(newBox2, connections.filter(c => c.box1 === newBox2 || c.box2 === newBox2));

        addNewBoxesOnClick(newBox1);
        addNewBoxesOnClick(newBox2);

        enableLineColorChange(connection1.path);
        enableLineColorChange(connection2.path);

        boxHierarchy.set(box, [
            { element: newBox1, connection1, connection2 },
            { element: newBox2, connection1, connection2 }
        ]);
    });
}

// Main logic
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = 'lineContainer';
svg.style.position = 'absolute';
svg.style.top = '0';
svg.style.left = '0';
svg.style.width = '100%';
svg.style.height = '100%';
container.appendChild(svg);  

const connections = [];

const box1 = createBox('red', 20, 30);
const box2 = createBox('green', 260, 150);
const box3 = createBox('blue', 260, 270);

connections.push(createConnection(box1, box2));
connections.push(createConnection(box1, box3));

const uniqueBoxes = new Set();
connections.forEach(connection => {
    uniqueBoxes.add(connection.box1);
    uniqueBoxes.add(connection.box2);
});

uniqueBoxes.forEach(box => {
    addNewBoxesOnClick(box);
    const relatedConnections = connections.filter(c => c.box1 === box || c.box2 === box);
    makeDraggable(box, relatedConnections);  
});

enablePanning();
connections.forEach(connection => enableLineColorChange(connection.path));
