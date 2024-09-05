
# Dynamic Box and Line Manipulation Project

This project allows users to dynamically create, manipulate, and connect draggable boxes on a web page, with zoom and pan functionality. The connections between the boxes are represented as curved lines, which adjust dynamically when the boxes are moved. This project was created by **Akshay Kotish**.

## Features

### 1. **Zoom and Pan**
- **Zoom In/Out**: You can zoom in and out on the container using the mouse scroll wheel. The zoom is centered on the current mouse position.
- **Panning**: Click and drag on an empty area of the container to pan the entire canvas. This allows for easy navigation around the workspace.

### 2. **Draggable Boxes**
- You can create boxes that can be dragged around the container.
- The boxes will maintain their position relative to your cursor when dragging, meaning they won't "jump" when you begin dragging.
- Boxes can be created dynamically and are assigned different colors for easy differentiation.
  
### 3. **Curved Lines Between Boxes**
- Boxes are connected by curved lines (SVG paths), and these lines automatically adjust when the connected boxes are moved.
- The connections between boxes are dynamic, so if the position of a box changes, the connecting line will update in real-time.

### 4. **Creating New Boxes and Connections**
- Double-clicking a box will create two new boxes and automatically connect them to the clicked box.
- The new boxes are placed relative to the clicked box and connected with curved lines.
- Newly created boxes also have the same draggable behavior and can generate further boxes.

### 5. **Dynamic Interaction**
- All boxes are draggable with real-time updates to their connections.
- Each new box can be dragged, and the connections remain intact and adjust as the boxes are moved.

## Project Structure

- **HTML + JavaScript**: The main logic is written in vanilla JavaScript, manipulating DOM elements.
- **SVG Paths**: SVG is used to draw the curved lines connecting the boxes. These paths adjust automatically as boxes are dragged.

## How It Works

### Initialization
- A container is created to hold all the draggable boxes and their connections.
- SVG paths are used to represent the lines between the boxes, and their paths are recalculated every time a box is moved.
  
### Box Creation and Connections
- Initially, a few boxes are created and connected with curved lines.
- You can drag and drop the boxes around the container, and the connecting lines will adjust accordingly.

### Zoom and Pan
- The entire container supports zooming and panning. Scroll to zoom in or out, and click and drag an empty space to pan.

### Adding New Boxes
- Double-click on any existing box to add two more boxes and automatically connect them to the original one with curved lines.

## How to Use

1. **Download or Clone the Project**:
   ```bash
   git clone https://github.com/akshay-kotish/box-line-manipulation.git
   ```

2. **Open the `index.html` file** in a browser to view the project.

3. **Interacting with the project**:
   - **Zoom in/out** using the mouse scroll.
   - **Pan** by clicking and dragging on the background.
   - **Drag** existing boxes by clicking and dragging them.
   - **Double-click** on a box to add two new connected boxes.

## Customization

- **Box Colors**: You can easily modify the color of the boxes by changing the color values in the `createBox` function.
- **Line Properties**: The color, thickness, and other attributes of the connecting lines can be modified in the `createConnection` function.

## Future Improvements
- **Save and Load Positions**: Add functionality to save the positions and connections of the boxes, allowing the user to load previous configurations.
- **Box Deletion**: Implement the ability to remove boxes and their associated connections.
- **Context Menu**: Add a right-click context menu for more interaction options, such as changing box color, deleting, or connecting boxes manually.

## Contributions

Contributions to the project are welcome. Feel free to open issues or submit pull requests.

## Author

This project was developed by **Akshay Kotish**.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
