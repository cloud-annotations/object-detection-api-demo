var g_mouse_is_down = false; // Used to draw the image on the canvas
var g_prev_pixel_X = -1; //
var g_prev_pixel_Y = -1; //
var g_line_width = 25; //

var g_min_X = 200; // Tracking the minimum/maximum mouse position
var g_min_Y = 200; // on the canvas makes it simple to create a
var g_max_X = 0; // bounding box around the drawn digit
var g_max_Y = 0; //

var g_saved_digit = null; // After an image has been sent to a deployment
// if a different deployment type is selected,
// reload the original drawn digit to resend to
// the other deployment type

function do_stuff_with_image(e) {
  const [first_image] = e.target.files;
  if (first_image) {
    const image = document.createElement("img");
    image.onload = () => {
      var canvas = document.getElementById("drawing_box");
      var ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, 300, 300);
    };
    image.src = URL.createObjectURL(first_image);
  }
}

function clearCanvas() {
  var canvas = document.getElementById("drawing_box");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearPayloadDiv() {
  document.getElementById("payload_pre").innerHTML = "";
  document.getElementById("payload_spinner").style.display = "none";
}

function populatePayloadDiv(payload) {
  document.getElementById("payload_spinner").style.display = "none";
  document.getElementById("payload_pre").innerHTML = JSON.stringify(
    payload,
    null,
    3
  );
}

function clearResultsDiv() {
  document.getElementById("results_pre").innerHTML = "";
  document.getElementById("results_spinner").style.display = "none";
}

function populateResultsDiv(result) {
  document.getElementById("results_spinner").style.display = "none";
  document.getElementById("results_pre").innerHTML = result;
}

function resetGlobalVars() {
  g_mouse_is_down = false;
  g_prev_pixel_X = -1;
  g_prev_pixel_Y = -1;
  g_min_X = 200;
  g_min_Y = 200;
  g_max_X = 0;
  g_max_Y = 0;
}

function resetUI() {
  clearCanvas();
  clearPayloadDiv();
  clearResultsDiv();
  document.getElementById("submit_button").title =
    "Submit current drawing for analysis";
}

function clear_everything() {
  resetUI();

  resetGlobalVars();

  g_saved_digit = null;
}

function saveImage() {
  var canvas = document.getElementById("drawing_box");
  var ctx = canvas.getContext("2d");
  g_saved_digit = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function revertImage() {
  resetUI();

  var ctx = document.getElementById("drawing_box").getContext("2d");
  ctx.putImageData(g_saved_digit, 0, 0);
}

function submit_drawing() {
  if (null !== document.getElementById("submit_button").title.match(/clear/i)) {
    alert("Click 'Clear' to clean the canvas and start again.");
    return;
  }

  document.getElementById("submit_button").title =
    "Click 'Clear' to clean the canvas and start again";

  document.getElementById("payload_spinner").style.display = "block";

  var canvas = document.getElementById("drawing_box");
  var ctx = canvas.getContext("2d");
  var image_data = ctx.getImageData(0, 0, 300, 300).data;

  var newarray = [];
  for (var i = 0; i < image_data.length; i += 4) {
    newarray.push([image_data[i], image_data[i + 1], image_data[i + 2]]);
  }

  var newarray2 = [];
  while (newarray.length) {
    newarray2.push(newarray.splice(0, 300));
  }

  var payload = { values: [newarray2] };

  populatePayloadDiv(payload);

  sendPayloadToDeployment(payload);
}

function drawRedBox(x, y, width, height) {
  var ctx = document.getElementById("drawing_box").getContext("2d");
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.stroke();
}

function get_bounding_box() {
  min_X = g_min_X - g_line_width / 2;
  min_Y = g_min_Y - g_line_width / 2;
  width = g_max_X - g_min_X + g_line_width;
  height = g_max_Y - g_min_Y + g_line_width;

  var ctx = document.getElementById("drawing_box").getContext("2d");
  var digit_img = ctx.getImageData(min_X, min_Y, width, height);

  // Use a red box to show what's going on
  drawRedBox(min_X, min_Y, width, height);

  return digit_img;
}

function center(digit_img) {
  var canvas = document.getElementById("drawing_box");
  var ctx = canvas.getContext("2d");

  // Center the digit on the canvas
  var digit_min_X = canvas.width / 2 - digit_img.width / 2;
  var digit_min_Y = canvas.height / 2 - digit_img.height / 2;
  clearCanvas();
  ctx.beginPath();
  ctx.putImageData(digit_img, digit_min_X, digit_min_Y);

  // Get a square bounding box
  var max_dimension =
    digit_img.height > digit_img.width ? digit_img.height : digit_img.width;
  var square_box_min_X = canvas.width / 2 - max_dimension / 2;
  var square_box_min_Y = canvas.height / 2 - max_dimension / 2;
  centered_img = ctx.getImageData(
    square_box_min_X,
    square_box_min_Y,
    max_dimension,
    max_dimension
  );

  // Use a red box to show what's going on
  drawRedBox(
    square_box_min_X - 2,
    square_box_min_Y - 2,
    max_dimension + 4,
    max_dimension + 4
  );

  return [centered_img, square_box_min_X, square_box_min_Y];
}

function resize_28x28(img, X, Y) {
  var canvas = document.getElementById("drawing_box");
  var ctx = canvas.getContext("2d");

  // Save a copy of the original image in a temporary canvas
  var tempCanvas1 = document.createElement("canvas");
  tempCanvas1.width = canvas.width;
  tempCanvas1.height = canvas.height;
  var tctx1 = tempCanvas1.getContext("2d");
  tctx1.putImageData(img, 0, 0);

  // Use a second temporary canvas to scale the image way down to 28x28
  var tempCanvas2 = document.createElement("canvas");
  tempCanvas2.width = canvas.width;
  tempCanvas2.height = canvas.height;
  var tctx2 = tempCanvas2.getContext("2d");
  scale = 28 / img.width;
  tctx2.scale(scale, scale);
  tctx2.drawImage(tempCanvas1, 0, 0);
  tiny_img = tctx2.getImageData(0, 0, 28, 28);

  // Show what's going on
  clearCanvas();
  ctx.beginPath();
  ctx.drawImage(tempCanvas2, 6, 6);
  drawRedBox(4, 4, 32, 32);

  return tiny_img;
}

function greyscale(img) {
  var canvas = document.getElementById("drawing_box");
  var ctx = canvas.getContext("2d");
  var grey_img = ctx.createImageData(img.width, img.height);

  // Set Red, Green, and Blue values to 0, keep the Alpha value
  for (var i = 0; i < img.data.length; i += 4) {
    grey_img.data[i] = 0;
    grey_img.data[i + 1] = 0;
    grey_img.data[i + 2] = 0;
    grey_img.data[i + 3] = img.data[i + 3];
  }

  // Show what's going on
  clearCanvas();
  ctx.beginPath();
  ctx.putImageData(grey_img, 6, 6);
  drawRedBox(4, 4, 32, 32);

  return grey_img;
}

function create_array_28x28(img) {
  var arr = [];
  for (var i = 0; i < img.data.length; i += 4) {
    arr.push(img.data[i + 3] / 255);
  }

  return arr;
}

function processresultHandler(result) {
  console.log(result);
  var result_str = JSON.stringify(result, null, 3);
  populateResultsDiv(result_str);

  for (var i = 0; i < 3; i++) {
    const [y, x, y2, x2] = result.keyed_values[
      result.keyed_values.findIndex(obj => obj.key === "detection_boxes")
    ].values[0][i];

    console.log(x, y, x2, y2);

    var ctx = document.getElementById("drawing_box").getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x * 300, y * 300, (x2 - x) * 300, (y2 - y) * 300);
    ctx.stroke();
  }
}
