from tests.width_detect.main import main as width_detect
from tests.segment_boards.main import main as segment_boards

def main():
    width_detect(input_dir="input/wooden_boards_images", output_dir="output/wooden_boards_images/width_detect", height=1, length=1)
    segment_boards(input_dir="input/wooden_boards_images", output_dir="output/wooden_boards_images/segment_boards")



if __name__ == "__main__":
    main()
