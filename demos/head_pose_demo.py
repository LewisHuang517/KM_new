"""
Head Pose Estimation Demo - iPhone Face ID Style

Dependencies:
pip install mediapipe opencv-python numpy
"""

import cv2
import numpy as np
import mediapipe as mp
from collections import deque
import time

# MediaPipe init
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Define capture angle targets (wider ranges for easier detection)
CAPTURE_TARGETS = {
    'front': {'yaw': (-15, 15), 'pitch': (-15, 15), 'label': 'Front', 'color': (0, 255, 0)},
    'left': {'yaw': (-50, -20), 'pitch': (-20, 20), 'label': 'Left', 'color': (255, 165, 0)},
    'right': {'yaw': (20, 50), 'pitch': (-20, 20), 'label': 'Right', 'color': (255, 165, 0)},
    'up': {'yaw': (-25, 25), 'pitch': (15, 40), 'label': 'Up', 'color': (255, 0, 255)},
    'down': {'yaw': (-25, 25), 'pitch': (-40, -15), 'label': 'Down', 'color': (0, 255, 255)},
}

# Stability detection params
STABILITY_FRAMES = 15  # Frames needed for stability
STABILITY_THRESHOLD = 3.0  # Angle change threshold (degrees)


class HeadPoseEstimator:
    """Head Pose Estimator using solvePnP"""

    # Landmark indices for pose estimation
    # Nose tip, Chin, Left eye outer, Right eye outer, Left mouth, Right mouth
    LANDMARK_IDS = [1, 152, 33, 263, 61, 291]

    def __init__(self):
        # 3D model points (standard face model)
        self.model_points = np.array([
            (0.0, 0.0, 0.0),          # Nose tip
            (0.0, -330.0, -65.0),     # Chin
            (-225.0, 170.0, -135.0),  # Left eye outer
            (225.0, 170.0, -135.0),   # Right eye outer
            (-150.0, -150.0, -125.0), # Left mouth
            (150.0, -150.0, -125.0)   # Right mouth
        ], dtype=np.float64)

        self.camera_matrix = None
        self.dist_coeffs = np.zeros((4, 1))

    def _init_camera_matrix(self, img_w, img_h):
        """Initialize camera intrinsic matrix"""
        focal_length = img_w
        center = (img_w / 2, img_h / 2)
        self.camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype=np.float64)

    def estimate(self, landmarks, img_w, img_h):
        """
        Estimate head pose

        Args:
            landmarks: MediaPipe face landmarks
            img_w: Image width
            img_h: Image height

        Returns:
            (yaw, pitch, roll) angles in degrees
        """
        if self.camera_matrix is None:
            self._init_camera_matrix(img_w, img_h)

        # Extract 2D image points
        image_points = np.array([
            (landmarks[idx].x * img_w, landmarks[idx].y * img_h)
            for idx in self.LANDMARK_IDS
        ], dtype=np.float64)

        # Use solvePnP to calculate pose
        success, rotation_vector, translation_vector = cv2.solvePnP(
            self.model_points,
            image_points,
            self.camera_matrix,
            self.dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not success:
            return None, None, None

        # Convert rotation vector to rotation matrix
        rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

        # Calculate Euler angles
        proj_matrix = np.hstack((rotation_matrix, translation_vector))
        _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)

        pitch = euler_angles[0, 0]  # Up/Down
        yaw = euler_angles[1, 0]    # Left/Right
        roll = euler_angles[2, 0]   # Tilt

        return yaw, pitch, roll


class FaceRegistrationDemo:
    """Face Registration Demo - iPhone Face ID Style"""

    def __init__(self):
        self.pose_estimator = HeadPoseEstimator()
        self.captured_angles = {}
        self.angle_history = deque(maxlen=STABILITY_FRAMES)
        self.last_capture_time = 0
        self.capture_cooldown = 1.0  # Capture cooldown (seconds)

    def check_angle_match(self, yaw, pitch):
        """Check if current angle matches a target"""
        for target_name, target in CAPTURE_TARGETS.items():
            if target_name in self.captured_angles:
                continue
            yaw_range = target['yaw']
            pitch_range = target['pitch']
            if (yaw_range[0] <= yaw <= yaw_range[1] and
                pitch_range[0] <= pitch <= pitch_range[1]):
                return target_name
        return None

    def check_stability(self, yaw, pitch):
        """Check if angle is stable"""
        self.angle_history.append((yaw, pitch))

        if len(self.angle_history) < STABILITY_FRAMES:
            return False, 0

        yaws = [a[0] for a in self.angle_history]
        pitches = [a[1] for a in self.angle_history]

        yaw_stable = (max(yaws) - min(yaws)) < STABILITY_THRESHOLD
        pitch_stable = (max(pitches) - min(pitches)) < STABILITY_THRESHOLD

        stability = len(self.angle_history) / STABILITY_FRAMES
        return yaw_stable and pitch_stable, stability

    def draw_progress_ring(self, frame, center, radius, progress, color):
        """Draw progress ring"""
        # Background ring
        cv2.circle(frame, center, radius, (100, 100, 100), 3)

        # Progress arc
        if progress > 0:
            start_angle = -90
            end_angle = start_angle + int(360 * progress)
            cv2.ellipse(frame, center, (radius, radius), 0,
                       start_angle, end_angle, color, 4)

    def draw_face_oval(self, frame, center, size, color, thickness=2):
        """Draw iPhone style oval frame"""
        cv2.ellipse(frame, center, size, 0, 0, 360, color, thickness)

    def draw_guidance(self, frame, target_name, progress):
        """Draw guidance text"""
        h, w = frame.shape[:2]

        if target_name:
            target = CAPTURE_TARGETS[target_name]
            text = f"Turn: {target['label']}"
            color = target['color']
        else:
            text = "Adjust to target angle"
            color = (200, 200, 200)

        # Draw guidance text
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(text, font, 1.2, 2)[0]
        text_x = (w - text_size[0]) // 2
        cv2.putText(frame, text, (text_x, 80), font, 1.2, color, 2)

        # Draw progress bar
        if target_name and progress > 0:
            bar_width = 200
            bar_height = 10
            bar_x = (w - bar_width) // 2
            bar_y = 100

            # Background
            cv2.rectangle(frame, (bar_x, bar_y),
                         (bar_x + bar_width, bar_y + bar_height),
                         (100, 100, 100), -1)
            # Progress
            cv2.rectangle(frame, (bar_x, bar_y),
                         (bar_x + int(bar_width * progress), bar_y + bar_height),
                         color, -1)

    def draw_angle_info(self, frame, yaw, pitch, roll):
        """Draw angle info"""
        h, w = frame.shape[:2]

        info_texts = [
            f"Yaw (L/R): {yaw:.1f}",
            f"Pitch (U/D): {pitch:.1f}",
            f"Roll (Tilt): {roll:.1f}"
        ]

        for i, text in enumerate(info_texts):
            cv2.putText(frame, text, (20, h - 80 + i * 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

    def draw_capture_status(self, frame):
        """Draw capture status"""
        h, w = frame.shape[:2]

        cv2.putText(frame, "Progress:", (w - 200, 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)

        y_offset = 70
        for target_name, target in CAPTURE_TARGETS.items():
            captured = target_name in self.captured_angles
            color = (0, 255, 0) if captured else (100, 100, 100)
            status = "[x]" if captured else "[ ]"
            text = f"{status} {target['label']}"
            cv2.putText(frame, text, (w - 180, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1)
            y_offset += 30

    def run(self):
        """Run demo"""
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

        with mp_face_mesh.FaceMesh(
            max_num_faces=1,  # Only detect one face
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as face_mesh:

            print("=" * 50)
            print("Head Pose Estimation Demo - iPhone Face ID Style")
            print("=" * 50)
            print("Align your face with the oval in the center")
            print("Follow the prompts to capture multiple angles")
            print("Press 'q' to quit, 'r' to reset")
            print("=" * 50)

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Horizontal flip (mirror)
                frame = cv2.flip(frame, 1)
                h, w = frame.shape[:2]

                # Create overlay
                overlay = frame.copy()

                # Convert color space
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = face_mesh.process(rgb_frame)

                center = (w // 2, h // 2)
                oval_size = (180, 240)

                current_target = None
                stability = 0

                if results.multi_face_landmarks:
                    face_landmarks = results.multi_face_landmarks[0]

                    # Estimate head pose
                    yaw, pitch, roll = self.pose_estimator.estimate(
                        face_landmarks.landmark, w, h
                    )

                    if yaw is not None:
                        # Check angle match
                        current_target = self.check_angle_match(yaw, pitch)

                        # Check stability
                        is_stable, stability = self.check_stability(yaw, pitch)

                        # Auto capture
                        current_time = time.time()
                        if (current_target and is_stable and
                            current_time - self.last_capture_time > self.capture_cooldown):
                            self.captured_angles[current_target] = {
                                'yaw': yaw,
                                'pitch': pitch,
                                'roll': roll,
                                'time': current_time
                            }
                            self.last_capture_time = current_time
                            print(f"[OK] Captured: {CAPTURE_TARGETS[current_target]['label']} "
                                  f"(Yaw: {yaw:.1f}, Pitch: {pitch:.1f})")

                            # Check if complete
                            if len(self.captured_angles) == len(CAPTURE_TARGETS):
                                print("\n*** Registration Complete! All angles captured ***")

                        # Draw face mesh (simplified)
                        mp_drawing.draw_landmarks(
                            image=overlay,
                            landmark_list=face_landmarks,
                            connections=mp_face_mesh.FACEMESH_TESSELATION,
                            landmark_drawing_spec=None,
                            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style()
                        )

                        # Draw angle info
                        self.draw_angle_info(overlay, yaw, pitch, roll)

                        # Determine oval color
                        if current_target:
                            if is_stable:
                                oval_color = (0, 255, 0)  # Green: stable
                            else:
                                oval_color = CAPTURE_TARGETS[current_target]['color']
                        else:
                            oval_color = (100, 100, 100)  # Gray: not aligned
                else:
                    oval_color = (0, 0, 255)  # Red: no face detected
                    self.angle_history.clear()

                # Blend overlay
                frame = cv2.addWeighted(overlay, 0.7, frame, 0.3, 0)

                # Draw iPhone style oval frame
                self.draw_face_oval(frame, center, oval_size, oval_color, 3)

                # Draw progress ring
                ring_center = (w // 2, h // 2)
                ring_radius = max(oval_size) + 20
                progress_value = len(self.captured_angles) / len(CAPTURE_TARGETS)
                self.draw_progress_ring(frame, ring_center, ring_radius,
                                       progress_value, (0, 255, 0))

                # Draw guidance
                self.draw_guidance(frame, current_target, stability)

                # Draw capture status
                self.draw_capture_status(frame)

                # Title
                cv2.putText(frame, "KindyGuard Face Registration", (20, 40),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

                # Show frame
                cv2.imshow('Head Pose Demo', frame)

                # Key handling
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('r'):
                    self.captured_angles.clear()
                    self.angle_history.clear()
                    print("\n[RESET] Progress cleared")

        cap.release()
        cv2.destroyAllWindows()

        # Output results
        print("\n" + "=" * 50)
        print("Registration Summary")
        print("=" * 50)
        for target_name, data in self.captured_angles.items():
            label = CAPTURE_TARGETS[target_name]['label']
            print(f"  {label}: Yaw={data['yaw']:.1f}, Pitch={data['pitch']:.1f}")
        print(f"\nTotal: {len(self.captured_angles)}/{len(CAPTURE_TARGETS)} angles")


if __name__ == "__main__":
    demo = FaceRegistrationDemo()
    demo.run()
