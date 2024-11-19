const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const API_URL = "http://###//ai/eye?PetType=cat";
const COOKIE = "JSESSIONID=***";

const IMAGE_FOLDER = "./unit_test_catEye";
const HTML_FILE = path.join(__dirname, "image_test_report.html");
const CSV_FILE = path.join(__dirname, "test_results.csv");

const successImages = [];
const failureImages = [];

// CSV 저장 함수
const saveToCsv = () => {
  const allResults = [...successImages, ...failureImages];
  const headers = [
    "Index",
    "FileName",
    "Extension",
    "Size",
    "ResponseTime",
    "Status",
    "Message",
  ];
  const rows = allResults.map((img, index) => [
    index + 1,
    img.imageName,
    img.extension,
    img.size,
    img.responseTime,
    img.success ? "Success" : `Error (${img.errorCode})`,
    img.errorMessage || "No message",
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  fs.writeFileSync(CSV_FILE, csvContent, "utf8");
  console.log(`CSV log saved: ${CSV_FILE}`);
};

const parseErrorMessage = (errorMessage) => {
  const dogMatch = errorMessage.match(/dog_prob:\s?([\d.]+)/);
  const catMatch = errorMessage.match(/cat_prob:\s?([\d.]+)/);
  const errorCodeMatch = errorMessage.match(/\b(\d{3})\b/); // 세 자리 숫자 코드 추출

  return {
    dog_prob: dogMatch ? parseFloat(dogMatch[1]) : "N/A",
    cat_prob: catMatch ? parseFloat(catMatch[1]) : "N/A",
    errorCode: errorCodeMatch ? parseInt(errorCodeMatch[1], 10) : null, // 에러 코드 반환
  };
};

// HTML 보고서 생성 함수
const generateHtmlReport = (startTime, endTime) => {
  const totalTests = successImages.length + failureImages.length;
  const totalExecutionTime = ((endTime - startTime) / 1000).toFixed(2);
  const successRate = ((successImages.length / totalTests) * 100).toFixed(2);

  // 통계 섹션
  const statsSection = `
    <section class="my-6">
      <div class="flex flex-row space-x-2 text-sm mb-3">
        <div class="font-medium">Test Duration:</div>
        <div>(${totalExecutionTime} seconds)</div>
      </div>
      <div class="stats stats-horizontal shadow bg-base-100 w-full rounded-md">
        <div class="stat">
          <div class="stat-title">Total Tests</div>
          <div class="stat-value">${totalTests}</div>
          <div class="stat-desc">Completed in total</div>
        </div>
        <div class="stat">
          <div class="stat-title">Success</div>
          <div class="stat-value text-success">${successImages.length}</div>
          <div class="stat-desc">${successRate}% passed</div>
        </div>
        <div class="stat">
          <div class="stat-title">Failures</div>
          <div class="stat-value text-error">${failureImages.length}</div>
          <div class="stat-desc">Errors</div>
        </div>
      </div>
    </section>
  `;

  const tableRows = successImages.concat(failureImages).map((img, index) => {
    const fileName = img.imageName;
    const fileNameWithoutExtension = img.imageName.replace(/\.[^/.]+$/, ""); // 확장자 제거
    const tooltipMessage = img.success
      ? Object.entries(img.responseData || {}).map(([key, value]) => `${key}: ${value.toFixed(2)}%`).join("\n")
      : img.errorCode === 400
      ? `400 종 판정 불일치\ndog_prob: ${parseErrorMessage(img.errorMessage).dog_prob}\ncat_prob: ${parseErrorMessage(img.errorMessage).cat_prob}`
      : img.errorMessage || "Unknown Error";

    return `
      <tr class="${img.success ? "hover:bg-green-200 bg-green-100" : "hover:bg-red-200 bg-red-100"}">
        <td class="text-xs text-center text-neutral">${index + 1}</td>
        <td class="relative">
          <div class="avatar tooltip tooltip-right" data-tip="${tooltipMessage}">
            <div class="mask rounded-lg h-12 w-12">
              <img src="./${IMAGE_FOLDER}/${fileName}" alt="${fileNameWithoutExtension}">
            </div>
          </div>
        </td>
        <td class="text-xs truncate font-medium">${fileNameWithoutExtension}</td>
        <td class="text-xs text-center">${img.extension}</td>
        <td class="text-xs text-right ${img.success ? "text-success" : "text-error"}">${img.size}</td>
        <td class="text-xs text-center ${img.success ? "text-success" : "text-error"}">${img.responseTime}</td>
        <td class="text-xs text-center ${img.success ? "text-success" : "text-error"}">
          ${img.success ? "✅ 200" : `❌ ${img.errorCode}`}
        </td>
      </tr>`;
  }).join("\n");

  const gallerySuccess = successImages.map((img) => {
    const tooltipMessage = Object.entries(img.responseData || {})
      .map(([key, value]) => `${key}: ${value.toFixed(2)}%`)
      .join("\n");
  
    return `
      <div class="card shadow-md rounded-lg w-40 h-40 tooltip" data-tip="${tooltipMessage}">
        <figure class="h-3/4 overflow-hidden">
          <img src="./${IMAGE_FOLDER}/${img.imageName}" alt="${img.imageName}" class="object-cover h-full w-full">
        </figure>
        <div class="card-body p-1 flex items-center justify-center">
          <h2 class="text-center text-xs font-medium truncate" title="${img.imageName}">${img.imageName}</h2>
        </div>
      </div>`;
  }).join("\n");
  
  const galleryFailure = failureImages.map((img) => {
    const tooltipMessage = img.errorCode === 400
      ? `종 판정 불일치\ndog_prob: ${parseErrorMessage(img.errorMessage).dog_prob}\ncat_prob: ${parseErrorMessage(img.errorMessage).cat_prob}`
      : img.errorMessage || "Unknown Error";
  
    const badgeClass = img.errorCode === 400 ? "badge-warning" : "badge-error";
  
    return `
      <div class="card shadow-md rounded-lg w-40 h-40 tooltip" data-tip="${tooltipMessage}">
        <figure class="h-3/4 overflow-hidden">
          <img src="./${IMAGE_FOLDER}/${img.imageName}" alt="${img.imageName}" class="object-cover h-full w-full">
        </figure>
        <div class="absolute top-2 left-2 badge ${badgeClass} text-white text-xs">
          ${img.errorCode === 400 ? "400" : `${img.errorCode}`}
        </div>
        <div class="card-body p-1 flex items-center justify-center">
          <h2 class="text-center text-xs font-medium truncate" title="${img.imageName}">${img.imageName}</h2>
        </div>
      </div>`;
  }).join("\n");  

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CatEye Unit Test Report</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css" rel="stylesheet" />
    </head>
    <body class="bg-base-100 text-base-content">
      <header class="px-20 flex items-center justify-between p-4 bg-base-200 shadow-md">
        <h1 class="text-2xl font-bold">CatEye Unit Test Report</h1>
        <div class="text-xs text-gray-500">Generated on: ${new Date().toLocaleString()}</div>
      </header>
      <div class="container mx-auto p-6">
        ${statsSection}
        <section class="mb-10">
          <h2 class="text-lg font-medium mb-3">📋 Test Results</h2>
          <p class="text-sm text-gray-500 mb-3">
            Below is a detailed summary of the test results, including individual performance metrics for each image.
          </p>
          <div class="overflow-x-auto rounded-md w-full">
            <table class="table text-sm border border-neutral-200">
              <thead class="bg-neutral-50">
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Extension</th>
                <th>Size</th>
                <th>Delay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          </div>
        </section>
        <section class="mb-10">
          <h2 class="text-lg font-medium mb-5">✅ Success Gallery</h2>
          <div class="grid grid-cols-4 gap-4">${gallerySuccess}</div>
        </section>
        <section>
          <h2 class="text-lg font-medium mb-5">❌ Failure Gallery</h2>
          <div class="grid grid-cols-4 gap-4">${galleryFailure}</div>
        </section>
      </div>
      </div>
      <footer class="p-4 bg-base-200 text-center text-xs text-gray-500">
        <b>Test Environment: Node.js | Jest</b>
        <p>Generated for internal testing purposes.</p>
      </footer>
    </body>
    </html>`;
  
  fs.writeFileSync(HTML_FILE, htmlContent, "utf8");
  console.log(`HTML report generated: ${HTML_FILE}`);
};


// 테스트 실행
describe("Cat Iris Analysis API Tests", () => {
  const images = fs.readdirSync(IMAGE_FOLDER).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
  const startTime = Date.now();

  images.forEach((image) => {
    test(`Testing Image: ${image}`, async () => {
      const imagePath = path.join(IMAGE_FOLDER, image);
      const stats = fs.statSync(imagePath);
      const fileExtension = path.extname(image).slice(1);
      const form = new FormData();
      form.append("AnimalImage", fs.createReadStream(imagePath));

      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

      const startRequestTime = Date.now();
      try {
        const response = await axios.post(API_URL, form, {
          headers: {
            ...form.getHeaders(),
            Cookie: COOKIE,
          },
          timeout: 8000,
        });
        const duration = `${Date.now() - startRequestTime} ms`;

        successImages.push({
          imageName: image,
          extension: fileExtension,
          filePath: imagePath,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          responseTime: duration,
          responseData: response.data, // 성공 응답 저장
          success: true,
        });
      } catch (error) {
        const duration = `${Date.now() - startRequestTime} ms`;
        const errorMessage = error.response?.data?.message || "No error message";
        const errorCodeFromMessage = errorMessage.match(/\b(400)\b/) ? 400 : error.response?.status;

        failureImages.push({
          imageName: image,
          extension: fileExtension,
          filePath: imagePath,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          responseTime: duration,
          errorCode: errorCodeFromMessage || "Unknown",
          errorData: error.response?.data || {},
          errorMessage,
          success: false,
        });
      }
    });
  });

  afterAll(() => {
    const endTime = Date.now();
    saveToCsv();
    generateHtmlReport(startTime, endTime);
  });
});
