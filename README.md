# AI Iris Image Analysis API Automated Testing

> This project is an internal test automation tool for ensuring reliability and improving quality of AI analysis APIs.

## **Actual Test Results Report:**  

### 1. [Results Report Website (Vercel Deployment)](https://jest-ai-cateye.vercel.app)  
### 2. [Analysis Issues Details (GitHub Issue #37)](https://github.com/KAU-SMART-PETS/Capstone_FE/issues/37)  

---

## Project Overview

We created **Jest-based automated testing** and visualization reports to track **inconsistent response** issues in AI image analysis APIs and ensure service reliability for users.

| Main Purpose | Details |
|:---|:---|
| Reliability Verification | Verify response consistency of AI iris analysis API with real user images |
| Issue Tracking | Automatically collect exceptions and failure cases by image resolution/size/format |
| Result Visualization | Analyze success/failure and detailed causes with HTML/CSV reports |

---

## Key Features

- **53+ test images** for API unit test automation
- Record response success/failure, detailed messages, response time, file size per image
- Save results as **HTML reports** and **CSV files**
- Visualize success/failure cases in tables and galleries

---

## Quick Start

1. **Prepare Test Images**  
   Place images in the `unit_test_catEye` folder.

2. **Run Tests**  
   ```bash
   npm install
   npx jest public/catEye.test.js
   ```

3. **Check Results**  
   - `public/index.html` : Visualization report  
   - `public/test_results.csv` : Result logs

---

## Test Results Summary

| Category | Normal Processing | Error Occurrence |
|:---:|:---:|:---:|
| **Dog Images** | Mostly successful | - |
| **Cat Images** | Partially successful | Mostly failed |

- **Error Causes:**  
  - Cat images can only process ultra-low capacity of 6~12KB, all general smartphone photos (several MB) fail  
  - Large result errors depending on eye magnification level and inclusion of surrounding skin tissue in images  
  - AI model is overfitted to academic data only, unable to process general user images  
  - Results vary even for the same image depending on resolution/compression method

---

## Analysis Issues and Conclusions

- **Period:** October 30, 2023 ~ November 17, 2023
- **Participation:**  
  - API request testing and troubleshooting collaboration  
  - Jest automation test design and implementation responsibility

- **Conclusion:**  
    - Academic research images were processed normally, but photos taken by general users (cases including tissue around the eyes, etc.) had errors in over 50% of cases
  - AI model's data processing limitations and server image capacity restrictions were identified as main causes and reported to the responsible personnel.


