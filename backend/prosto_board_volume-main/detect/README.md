# Detect Service

This microservice provides a REST API for object detection and segmentation in images using deep learning models.

## Running the Application

### Local Launch

Start the application using Uvicorn. Example command:

   ```bash
   uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The server will automatically reload when code changes are detected.

## API Endpoints

This microservice provides two main endpoints for image analysis.

### 1. Object Detection

**Endpoint:** `/detect/` (POST)

**Input Parameters:**

- **file**: The image file to be analyzed.  
  Data format: **multipart/form-data**.  
  Uses the `Detection_schema_input` schema (from `detect/schemas/detect.py`), where `file` is of type `UploadFile` (supports JPEG, PNG, etc.).

_Example cURL request:_

```bash
curl -X POST "http://localhost:8000/detect/" \
  -F "file=@path/to/your/image.jpg"
```

**Output Parameters:**

The response is a JSON array of objects conforming to the `Detection` schema (from `detect/schemas/detect.py`).

Each object contains the following fields:

- **x_min** (float): Minimum x-coordinate of the bounding box.
- **y_min** (float): Minimum y-coordinate of the bounding box.
- **x_max** (float): Maximum x-coordinate of the bounding box.
- **y_max** (float): Maximum y-coordinate of the bounding box.
- **confidence** (float): Confidence level (value from 0 to 1).
- **class_name** (string): Name of the detected object class.

_Example expected response:_

```json
[
  {
    "x_min": 10.5,
    "y_min": 20.0,
    "x_max": 150.0,
    "y_max": 200.5,
    "confidence": 0.92,
    "class_name": "object_label"
  },
  {
    "x_min": 160.0,
    "y_min": 30.0,
    "x_max": 300.0,
    "y_max": 250.0,
    "confidence": 0.87,
    "class_name": "another_label"
  }
]
```

### 2. Object Segmentation

**Endpoint:** `/detect_seg/` (POST)

**Input Parameters:**

- **file**: The image file to be analyzed.  
  Data format: **multipart/form-data**.  
  Uses the same `Detection_schema_input` schema (from `detect/schemas/detect.py`).

_Example cURL request:_

```bash
curl -X POST "http://localhost:8000/detect_seg/" \
  -F "file=@path/to/your/image.jpg"
```

**Output Parameters:**

The response is a JSON array of objects conforming to the `Detection_Seg` schema (from `detect/schemas/detect.py`).

Each object contains the following fields:

- **confidence** (float): Model's confidence in the detection.
- **class_name** (string): Name of the detected object class.
- **points** (array): List of points, each point has fields:
  - **x** (float): X coordinate.
  - **y** (float): Y coordinate.

_Example expected response:_

```json
[
  {
    "confidence": 0.93,
    "class_name": "object_label",
    "points": [
      { "x": 12.3, "y": 45.6 },
      { "x": 78.9, "y": 10.11 },
      { "x": 23.4, "y": 56.7 },
      ...
    ]
  },
  {
    "confidence": 0.88,
    "class_name": "another_label",
    "points": [
      { "x": 130.5, "y": 220.0 },
      { "x": 150.5, "y": 240.0 },
      { "x": 170.5, "y": 260.0 },
      ...
    ]
  }
]
```

## Notes

- Ensure that the model settings in `core/settings.py` are correctly configured for the models being used.
- The `Detection_Seg` schema is used for object segmentation and includes a list of points defining the object's contour.
