const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
var originText = document.querySelector("#origin-text p").innerHTML;
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const accuracyLabel = document.querySelector(".accuracy");
const wordsPerMinuteLabel = document.querySelector(".wpm");
const message = document.querySelector("#message"); // Thêm phần tử thông báo
const completionMessage = document.querySelector("#completion-message"); // Thêm phần tử thông báo hoàn thành
const successAnimation = document.querySelector("#success-animation");
const failureAnimation = document.querySelector("#failure-animation");
const startSound = document.getElementById("start-sound");




var timer = [0,0,0,0];
var interval;
var wpmInterval;
var timerRunning = false;
var errors = 0;
var timeElapsed = 0;
var randomParagraph = 0;
var wpm;
var timeLimit = 60; // Thời gian giới hạn là 60 giây (1 phút)


// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time) {
    if (time <= 9) {
        time = "0" + time;
    }
    return time;
}

// Run a standard minute/second/hundredths timer:
function runTimer() {
    let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
    theTimer.innerHTML = currentTime;
    timer[3]++;

    timer[0] = Math.floor((timer[3]/100)/60);
    timer[1] = Math.floor((timer[3]/100) - (timer[0] * 60));
    timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000));

    timeElapsed = timer[0]*60 + timer[1];

    if (timeElapsed >= timeLimit) {
      clearInterval(interval);
      clearInterval(wpmInterval);
      testArea.disabled = true;
      testWrapper.style.borderColor = "#E95D0F"; //Orange
      message.innerHTML = "Hết giờ! Vui lòng thử lại."; // Hiển thị thông báo
    }
}

// Finds words per minute
function wordsPerMinute() {
  if (timeElapsed > 0) {
    let words = testArea.value.split(' ').length; // Calculate words based on spaces
    let grossWpm = Math.floor(words / (timeElapsed / 60));
    wpm = Math.floor(grossWpm - errors); // Calculate net WPM

    if (wpm < 0) {
        wordsPerMinuteLabel.innerHTML = "0 WPM";
    } else {
        wordsPerMinuteLabel.innerHTML = wpm + " WPM";
    }
    accuracy(grossWpm);
}
}

// Finds the accuracy

function spellCheck() {
  let textEntered = testArea.value;
  let originTextSplit = originText.split('');
  let textEnteredSplit = textEntered.split('');

  // Tạo bản sao của văn bản gốc để hiển thị lỗi
  let displayedText = originTextSplit.map(char => `<span>${char}</span>`).join('');

  // So sánh từng ký tự
  let minLength = Math.min(originTextSplit.length, textEnteredSplit.length);
  for (let i = 0; i < minLength; i++) {
      if (originTextSplit[i] !== textEnteredSplit[i]) {
          // Đánh dấu ký tự sai
          displayedText = displayedText.replace(new RegExp(`\\b${originTextSplit[i]}\\b`), `<span class="highlight-error">${originTextSplit[i]}</span>`);
      }
  }

  // Xử lý ký tự thừa hoặc thiếu
  if (textEnteredSplit.length > originTextSplit.length) {
      for (let i = originTextSplit.length; i < textEnteredSplit.length; i++) {
          displayedText += `<span class="highlight-error">${textEnteredSplit[i]}</span>`;
      }
  }

  if (originTextSplit.length > textEnteredSplit.length) {
      for (let i = textEnteredSplit.length; i < originTextSplit.length; i++) {
          displayedText = displayedText.replace(new RegExp(`\\b${originTextSplit[i]}\\b`), `<span class="highlight-error">${originTextSplit[i]}</span>`);
      }
  }
}


// Match the text entered with the provided text on the page:
function spellCheck() {
  let textEntered = testArea.value.trim();
  let originWords = originText.trim().split(/\s+/);
  let enteredWords = textEntered.split(/\s+/);

  let correctWords = 0;
  let incorrectWords = 0;

  // Tạo một bản sao của văn bản gốc để hiển thị lỗi
  let displayedText = originText.split(/\s+/).map(word => `<span>${word}</span>`).join(' ');

  // So sánh từng từ
  let maxWords = Math.max(originWords.length, enteredWords.length);
  for (let i = 0; i < maxWords; i++) {
      if (originWords[i] === undefined || enteredWords[i] === undefined) {
          incorrectWords++; // Nếu một bên thiếu từ, coi là lỗi
      } else if (originWords[i] === enteredWords[i]) {
          correctWords++;
      } else {
          incorrectWords++;
          // Thêm lớp lỗi vào từ sai
          displayedText = displayedText.replace(new RegExp(`\\b${originWords[i]}\\b`), `<span class="highlight-error">${originWords[i]}</span>`);
      }
  }

  errors = incorrectWords; // Cập nhật số lỗi

  // Cập nhật nội dung văn bản hiển thị
  document.querySelector("#origin-text p").innerHTML = displayedText;

  if (textEntered === originText) {
      clearInterval(interval);
      clearInterval(wpmInterval);
      testWrapper.style.borderColor = "#429890"; // Xanh lá cây khi đúng
      testArea.disabled = true;
      showCompletionMessage(); // Hiển thị thông báo hoàn thành
  } else {
      // Kiểm tra lỗi chính tả từng ký tự
      let incorrectCount = 0;
      for (let i = 0; i < textEntered.length; i++) {
          if (textEntered[i] !== originText[i]) {
              incorrectCount++;
          }
      }
      errors = incorrectCount; // Cập nhật số lỗi

      if (textEntered === originText.substring(0, textEntered.length)) {
          testWrapper.style.borderColor = "#65CCf3"; // Xanh dương khi đúng một phần
      } else {
          testWrapper.style.borderColor = "#E95D0F"; // Cam khi sai
      }
      wordsPerMinute();
      accuracy(wpm); // Cập nhật độ chính xác
  }
}



// Hiển thị thông báo hoàn thành
function showCompletionMessage() {
  console.log('Show completion message called'); // Thêm dòng này để kiểm tra
  completionMessage.innerHTML = `
      <div class="completion-popup">
          <h2>Chúc mừng!</h2>
          <p>Bạn đã hoàn thành bài kiểm tra.</p>
          <p>Tốc độ đánh máy: ${wordsPerMinuteLabel.innerHTML}</p>
          <p>Độ chính xác: ${accuracyLabel.innerHTML}</p>
          <button onclick="reset()">Thử lại</button>
      </div>
  `;
  completionMessage.style.display = 'block';// Hiển thị bảng thông báo hoàn thành
  completionMessage.classList.add('show');
  completionMessage.classList.remove('hidden'); 
  showSuccessAnimation(); // Hiển thị hoạt hình thành công
}

// Start the timer:
function start() {
    let textEnteredLength = testArea.value.length;
    if (textEnteredLength === 0 && !timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
        wpmInterval = setInterval(wordsPerMinute, 1000);
        startSound.play(); // Play start sound
    }
}

//Generates a new paragraph:
function randomParagraphGenerator() {
    let par1 = "Một chú chó nhỏ vẫy đuôi ngoài sân. Cứ thấy người lạ là chú ta sủa một tràng vô cùng gắt gỏng đinh tai. Kể cả khi người lạ khuất bóng, vẫn thấy chú ta sủa. Chú chó sủa không chỉ để đuổi người lạ đi, trong tiếng sủa của chú còn dồn chứa sự phẫn uất với người chủ nuôi mình. (Tại sao một cậu bé đáng yêu như tôi lại phải đứng ngoài sân canh nhà. Gã chủ thật tệ bạc!)";
    let par2 = "Con người thật là ác độc đó bạn có biết không nếu như bạn đang làm một cái gì đó thì bạn đỏ vẫn người kinh lại đi loại lớn tôi tuổi công đức công công hợp hoài mĩ ngoài ngoại sơ sở cơm cơ thế loại vàng kinh nhạc kinh hoàn hoài nơi ở đơn hoàn húc hương dương minh sơ minh châu cơm đạn có con người vui vì con vật kinh hoài lớn lắm người mình có biết cái gì đỏ đơn màu mĩ miệu như hương hoa sung sắc sắc đơn đơn hoài hoạn loạn lạc khắp nơi trên thế đất này có cái lớn lợi đạn đơn đang hoàn đơn hoàng đất hoàn toàn đợi nơi chính là phát đạt lễ ly lợn con ôi ơ thật ơ hay in ôm.";
    let par3 = "Tết cổ truyền đến là dịp để mỗi người có thời gian sum vầy bên gia đình. Năm nay, gia đình em sẽ về quê ngoại để ăn Tết. Mọi năm, gia đình em thường ăn Tết ở quê nội - trên thành phố. Nhưng năm nay, em đã được trải nghiệm không khí Tết ở một vùng nông thôn. Em cảm thấy rất tuyệt vời và thú vị.";
    let par4 = "Bằng một cách nào đó, vô tình hay cố ý, mẹ luôn thể hiện khiến trong mắt mọi người, mẹ tôi là một người mẹ hiền lành, thánh thiện, đáng thương, yêu thương con cái vô bờ bến, còn tôi thì là một đứa không biết điều, xấu tính, bất hiếu, thất bại, kém cỏi. Tôi luôn là một nhân vật phản diện còn mẹ thì là người tốt. Suốt hơn hai mươi năm nay vẫn luôn như thế, tôi cảm thấy đau khổ nhưng bất lực. Trước giờ tôi luôn nghĩ rằng mẹ rất yêu thương tôi, chỉ là do tính cách và EQ thấp nên mới vô tình cư xử như vậy thôi, vậy nên tôi chỉ đau khổ chứ không dám trách mẹ, nhưng chuyện ngày hôm qua khiến tôi nghĩ lại, liệu mẹ có thật sự yêu thương tôi hay không?";
    let par5 = "Ý tưởng khởi đầu của nhóm là về một app thu thập dữ liệu public, xử lý và lưu trữ để làm giàu thêm cơ sở dữ liệu khách hàng. Nó xuất phát từ những hạn chế khi khách hàng buộc phải nhập liệu và update database thủ công, trong khi dữ liệu đó đã được đưa lên website từ trước.";
    let par6 = "Rồi lần lượt các ý tưởng khác được vẽ ra, từ những cái mang tính ứng dụng cao (nhưng khó) như xây dựng chatbot để hỏi đáp trên file văn bản, đến cái chỉ phục vụ mục đích chơi bời như tạo app để connect, tăng tương tác mọi người thông qua các open activities.";
    let par7 = "Sau đó là liên tục các cuộc “meeting” để thống nhất ý tưởng, xác định pros and cons, vẽ sơ đồ luồng hoạt động, define database. Sau khoảng 4 ngày, những ý tưởng mơ hồ cũng dần thành hình. Bọn mình sẽ làm một app quản lý dự án, tích hợp OpenAI để có thể chat trực tiếp như một assistance, rồi auto reporting, warning.";
    let par8 = "Nếu ai đã có dịp đặt chân đến thủ đô Hà Nội chắc chắn sẽ biết đến Hồ Gươm, đây không chỉ là một địa điểm vui chơi nhộn nhịp nổi tiếng nhất Hà thành mà còn là địa danh mang dấu tích lịch sử dân tộc.";
    let par9 = "Nước ta dưới thời bị giặc Minh đô hộ vô cùng khổ cực, dân chúng lầm than bị bóc lột, đày đọa coi như cỏ rác. Lúc bấy giờ có nghĩa quân Lam Sơn đã nhiều lần nổi dậy chống giặc nhưng vì non yếu nên đều bị thua.Đức Long Quân nơi biển khơi nhìn thấy tinh thần và ý chí của nghĩa quân cũng như sự lầm than của con dân nên đã quyết định cho mượn gươm thần để đánh giặc.";
    let par10 = "Tôi muốn nói với bạn rằng, trên thế giới này, không ai có thể cản bước được bạn, người trói buộc bạn chỉ có bản thân bạn mà thôi. 99% phiền muộn trong cuộc sống không đến từ bản thân sự việc, mà là từ phản ứng của bạn đối với sự việc này.";

    switch (Math.floor(Math.random() * 10)) {
      case 0:
        originText = par1;
        document.querySelector("#origin-text p").innerHTML = par1;
        break;
      case 1:
        originText = par2;
        document.querySelector("#origin-text p").innerHTML = par2;
        break;
      case 2:
        originText = par3;
        document.querySelector("#origin-text p").innerHTML = par3;
        break;
      case 3:
        originText = par4;
        document.querySelector("#origin-text p").innerHTML = par4;
        break;
      case 4:
        originText = par5;
        document.querySelector("#origin-text p").innerHTML = par5;
        break;
      case 5:
        originText = par6;
        document.querySelector("#origin-text p").innerHTML = par6;
        break;
      case 6:
        originText = par7;
        document.querySelector("#origin-text p").innerHTML = par7;
        break;
      case 7:
        originText = par8;
        document.querySelector("#origin-text p").innerHTML = par8;
        break;
      case 8:
        originText = par9;
        document.querySelector("#origin-text p").innerHTML = par9;
        break;
      case 9:
        originText = par10;
        document.querySelector("#origin-text p").innerHTML = par10;
        break;
    }

}

// Reset everything:
function reset() {
    clearInterval(interval);
    clearInterval(wpmInterval);
    interval = null;
    wpmInterval = null;
    timer = [0,0,0,0];
    timerRunning = false;
    wpm = "0 WPM";
    timeElapsed = 0;
    errors = 0;
  
    testArea.value = "";
    testArea.disabled = false;
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";
    accuracyLabel.innerHTML = "100%";
    wordsPerMinuteLabel.innerHTML = wpm;
    randomParagraphGenerator();
    completionMessage.style.display = 'none'; // Ẩn bảng thông báo hoàn thành
    const hearts = document.querySelectorAll('.heart-animation');
    hearts.forEach(heart => heart.remove());
}

// Hiển thị nhiều trái tim bay lên
function showSuccessAnimation() {
  console.log('Show success animation called'); // Kiểm tra hàm có được gọi không

  // Chỉ thực hiện khi có thông báo hoàn thành
  if (completionMessage.style.display === 'block') {
    const numberOfHearts = 1000; // Số lượng trái tim muốn hiển thị
    for (let i = 0; i < numberOfHearts; i++) {
        const heart = document.createElement("div");
        heart.className = "heart-animation";
        heart.innerHTML = "❤️"; // Hoặc sử dụng một hình trái tim tùy chỉnh

        // Tùy chỉnh vị trí trái tim để tạo hiệu ứng phân tán
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${Math.random() * 20 + 20}px`; // Kích thước ngẫu nhiên

        document.body.appendChild(heart);

        // Xóa trái tim sau khi hoàn thành hoạt hình
        setTimeout(() => {
            document.body.removeChild(heart);
        }, 9000); // Thời gian hoạt hình
    }
  }
}




// Event listeners for keyboard input and the reset
testArea.addEventListener("keypress", start, false);
testArea.addEventListener("keyup", spellCheck, false);
resetButton.addEventListener("click", reset, false);