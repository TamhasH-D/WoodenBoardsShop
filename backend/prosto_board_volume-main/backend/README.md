# Wooden Boards Volume Service

This microservice provides a REST API for calculating the volume of wooden boards using deep learning models. The service analyzes images of lumber stacks and performs volume calculations based on detection and segmentation results.

## Running the Application

### Local Launch

Start the application using Uvicorn:
   ```bash
   uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### 1. Volume Calculation Based on Bounding Box

**Endpoint:** `/wooden_boards_volume/` (POST)

Calculates the volume of boards based on bounding boxes.

**Input Parameters:**

Format: `multipart/form-data`

- **image**: (file) Image of the lumber stack (JPEG, PNG)
- **height**: (float, default 2.25) Actual board height in meters
- **length**: (float, default 16) Board length in meters

```bash
curl -X POST "http://localhost:8000/wooden_boards_volume/" \
  -F "image=@path/to/image.jpg" \
  -F "height=2.25" \
  -F "length=16"
```

**Output Parameters:**

```json
{
  "total_volume": 12.5,
  "total_count": 2,
  "wooden_boards": [
    {
      "volume": 6.2,
      "height": 2.25,
      "width": 0.17,
      "length": 16.0,
      "detection": {
        "x_min": 100.5,
        "y_min": 150.0,
        "x_max": 200.5,
        "y_max": 300.0,
        "confidence": 0.95,
        "class_name": "wooden_board"
      }
    }
  ]
}
```

where:
- **total_volume**: Total volume of all boards in cubic meters
- **total_count**: Number of detected boards
- **wooden_boards**: Array of detected boards, each containing:
  - **volume**: Board volume in cubic meters
  - **height**: Board height in meters
  - **width**: Board width in meters
  - **length**: Board length in meters
  - **detection**: Detection data:
    - **x_min, y_min, x_max, y_max**: Bounding box coordinates
    - **confidence**: Model confidence (0-1)
    - **class_name**: Object class name

### 2. Volume Calculation Using Segmentation

**Endpoint:** `/wooden_boards_volume_seg/` (POST)

Calculates board volume based on precise contour segmentation.

**Input Parameters:**

Format: `multipart/form-data`

- **image**: (file) Image of the lumber stack (JPEG, PNG)
- **height**: (float, default 2.25) Actual board height in meters
- **length**: (float, default 16) Board length in meters

```bash
curl -X POST "http://localhost:8000/wooden_boards_volume_seg/" \
  -F "image=@path/to/image.jpg" \
  -F "height=2.25" \
  -F "length=16"
```

**Operation Mechanism:**
1. Getting contour points through segmentation
2. Approximating the contour to a quadrilateral
3. Ordering points clockwise
4. Calculating real dimensions based on scaling
5. Computing volume using average side values

**Output Parameters:**

```json
{
  "total_volume": 12.5,
  "total_count": 2,
  "wooden_boards": [
    {
      "volume": 6.2,
      "height": 2.25,
      "width": 0.17,
      "length": 16.0,
      "detection": {
        "confidence": 0.95,
        "class_name": "wooden_board",
        "points": [
          {"x": 100.0, "y": 150.0},
          {"x": 200.0, "y": 150.0},
          {"x": 200.0, "y": 300.0},
          {"x": 100.0, "y": 300.0}
        ]
      }
    }
  ]
}
```

where:
- **total_volume**: Total volume of all boards in cubic meters
- **total_count**: Number of detected boards
- **wooden_boards**: Array of detected boards, each containing:
  - **volume**: Board volume in cubic meters
  - **height**: Board height in meters
  - **width**: Board width in meters
  - **length**: Board length in meters
  - **detection**: Segmentation data:
    - **confidence**: Model confidence (0-1)
    - **class_name**: Object class name
    - **points**: Array of contour points (4 points, ordered clockwise)

## Settings and Configuration

### Main Parameters

- `WOOD_DETECTION_URL`: URL of the board detection service
- `WOOD_DETECTION_SEG_URL`: URL of the board segmentation service
- `CONFIDENCE_THRESHOLD`: Confidence threshold for filtering results

These parameters are configured in `core/settings.py`.

