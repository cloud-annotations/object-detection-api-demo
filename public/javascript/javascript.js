const handleImageChange = e => {
  document.getElementById("main_spinner").style.display = "block";
  const [first_image] = e.target.files;
  if (first_image) {
    const image = document.createElement("img");
    image.onload = () => {
      const canvas = document.getElementById("drawing_box");
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, 300, 300);
      detectWithCanvas(canvas);
    };
    image.src = URL.createObjectURL(first_image);
  }
};

const unwrap = keyed_values => {
  let res = {};
  keyed_values.forEach(obj => {
    res[obj.key] = obj.values[0];
  });
  return res;
};

const detectWithCanvas = async canvas => {
  const imageArray = await tf.browser.fromPixels(canvas).array();

  const { keyed_values } = await fetch("/api/detect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(imageArray)
  }).then(res => res.json());

  const { detection_boxes, detection_scores } = unwrap(keyed_values);

  detection_scores
    .filter(score => score >= 0.5)
    .forEach((_, i) => {
      const [y, x, y2, x2] = detection_boxes[i];

      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(
        x * canvas.width,
        y * canvas.height,
        (x2 - x) * canvas.width,
        (y2 - y) * canvas.height
      );
      ctx.stroke();
    });

  document.getElementById("main_spinner").style.display = "none";
};
