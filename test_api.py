# -*- coding: utf-8 -*-
"""
VinaMec Dental Care - API Automated Test & Excel Exporter
Tự động hóa kiểm thử các API chức năng của hệ thống Nha khoa VinaMec
và xuất báo cáo kết quả ra file Excel được thiết kế giao diện cực kỳ chuyên nghiệp.
Console output uses ASCII to prevent encoding errors on Windows terminals.
"""

import os
import sys
import time
import json
import subprocess
from datetime import datetime

# ==============================================================================
# 1. AUTO-INSTALL REQUIRED LIBRARIES
# ==============================================================================
def install_and_import(package, pip_name=None):
    if pip_name is None:
        pip_name = package
    try:
        __import__(package)
    except ImportError:
        # Use clean ASCII for console print to avoid UnicodeEncodeError on Windows CP1252
        print(f"[+] Library '{package}' is not installed. Installing automatically...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name])
            print(f"[OK] Installed '{package}' successfully!")
        except Exception as e:
            print(f"[ERROR] Failed to install '{package}': {e}")
            print(f"[!] Please install manually: pip install {pip_name}")
            sys.exit(1)

# Check and install required packages
install_and_import("requests")
install_and_import("pandas")
install_and_import("openpyxl")

import requests
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

# ==============================================================================
# 2. SYSTEM CONFIGURATION
# ==============================================================================
BASE_URL = "http://localhost:5000/api"

# Default credentials defined in backend seeder
ADMIN_CREDENTIALS = {
    "email": "admin@vinamec.vn",
    "password": "admin123"
}
DOCTOR_CREDENTIALS = {
    "email": "doctor@vinamec.vn",
    "password": "doctor123"
}
PATIENT_CREDENTIALS = {
    "email": "patient@vinamec.vn",
    "password": "patient123"
}

# ==============================================================================
# 3. TEST RESULT STORAGE
# ==============================================================================
test_results = []
shared_data = {
    "admin_token": None,
    "doctor_token": None,
    "patient_token": None,
    "doctor_id": None,       # Doctor profile ID
    "doctor_user_id": None,  # Doctor User account ID
    "patient_id": None,      # Patient profile ID
    "patient_user_id": None, # Patient User account ID
    "service_id": None,      # Service ID
    "shift_id": None,        # Dynamic shift ID
    "appointment_id": None,  # Dynamic appointment ID
    "tomorrow_date": None    # Date tomorrow (YYYY-MM-DD)
}

# Calculate tomorrow's date
from datetime import timedelta
tomorrow = datetime.now() + timedelta(days=1)
shared_data["tomorrow_date"] = tomorrow.strftime("%Y-%m-%d")

# ==============================================================================
# 4. API TEST EXECUTION ENGINE
# ==============================================================================
def run_test(test_id, category, name, method, endpoint, payload=None, headers=None, expected_status=200):
    url = f"{BASE_URL}{endpoint}"
    start_time = time.time()
    
    # Clean ASCII console log
    print(f"\n[{test_id}] {category} | {name}")
    print(f" -> {method} {url}")
    if payload:
        payload_str = json.dumps(payload, ensure_ascii=False)
        if len(payload_str) > 100:
            payload_str = payload_str[:100] + "..."
        print(f"    Body: {payload_str}")

    status = "FAIL"
    response_code = 0
    response_text = ""
    duration = 0
    response_data = None

    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=payload, headers=headers, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, json=payload, headers=headers, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")

        response_code = response.status_code
        duration = round(time.time() - start_time, 3)
        response_text = response.text
        
        try:
            response_data = response.json()
        except:
            response_data = None

        if response_code == expected_status:
            status = "PASS"
            print(f" [OK] SUCCESS (HTTP {response_code}) - {duration}s")
        else:
            status = "FAIL"
            print(f" [X] FAILED (HTTP {response_code}, Expected: {expected_status}) - {duration}s")
            if response_data and "message" in response_data:
                print(f"     Server Message: {response_data['message']}")

    except Exception as e:
        duration = round(time.time() - start_time, 3)
        response_code = 500
        response_text = f"Connection error: {str(e)}"
        status = "FAIL"
        print(f" [X] EXCEPTION: {e}")

    # Log the result with Vietnamese strings for Excel export (Excel handles UTF-8 perfectly!)
    test_results.append({
        "ID": test_id,
        "Nhóm": category,
        "Chức Năng": name,
        "Phương Thức": method,
        "Endpoint": endpoint,
        "Kỳ Vọng": expected_status,
        "Thực Tế": response_code,
        "Kết Quả": status,
        "Thời Gian (s)": duration,
        "Chi Tiết": response_text[:1000]
    })
    
    return status, response_data

# ==============================================================================
# 5. INTEGRATION TEST FLOWS
# ==============================================================================
def execute_test_suite():
    print("=" * 80)
    print("      VINAMEC DENTAL CARE - AUTOMATED API VERIFICATION SYSTEM      ")
    print("=" * 80)
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Base URL: {BASE_URL}")
    print(f"Test Appointment Date: {shared_data['tomorrow_date']}")
    print("=" * 80)

    # Pre-flight check if server is online
    try:
        requests.get(f"{BASE_URL}/health", timeout=3)
    except Exception:
        print("[!] WARNING: VinaMec Dental Care server is currently OFFLINE.")
        print(f"    Could not connect to {BASE_URL}")
        print("    Please start the server first before running the full test:")
        print("    1. Open a terminal in backend directory")
        print("    2. Run: npm run dev  or  npm start")
        print("-" * 80)
        
        # Log failure
        test_results.append({
            "ID": "INIT-01",
            "Nhóm": "He thong",
            "Chức Năng": "Kiem tra ket noi Server Backend",
            "Phương Thức": "GET",
            "Endpoint": "/health",
            "Kỳ Vọng": 200,
            "Thực Tế": 0,
            "Kết Quả": "FAIL",
            "Thời Gian (s)": 0.0,
            "Chi Tiết": "Server is offline. Vui long bat backend server truoc."
        })
        export_to_excel()
        return

    # --------------------------------------------------------------------------
    # GROUP 1: PUBLIC APIS
    # --------------------------------------------------------------------------
    run_test("TC-01", "Public API", "Kiem tra trang thai he thong (Health)", "GET", "/health", expected_status=200)
    
    _, services_res = run_test("TC-02", "Public API", "Lay danh sach dich vu nha khoa", "GET", "/services", expected_status=200)
    if services_res and services_res.get("success") and services_res.get("data"):
        services_list = services_res["data"]
        if len(services_list) > 0:
            shared_data["service_id"] = services_list[0]["_id"]
            print(f"    Resolved Service ID: {shared_data['service_id']} ({services_list[0]['name']})")
            
    run_test("TC-03", "Public API", "Lay danh muc cac nhom dich vu", "GET", "/services/categories", expected_status=200)
    
    chat_payload = {"message": "Lam sao de han che sau rang?"}
    run_test("TC-04", "Public API", "Hoi dap voi AI Chatbot cong cong", "POST", "/chat/public", payload=chat_payload, expected_status=200)

    # --------------------------------------------------------------------------
    # GROUP 2: ADMIN APIS
    # --------------------------------------------------------------------------
    admin_login_payload = {
        "email": ADMIN_CREDENTIALS["email"],
        "password": ADMIN_CREDENTIALS["password"]
    }
    status, login_res = run_test("TC-05", "Quan tri vien", "Dang nhap tai khoan Admin", "POST", "/auth/login", payload=admin_login_payload, expected_status=200)
    if status == "PASS" and login_res and login_res.get("success"):
        shared_data["admin_token"] = login_res["data"]["token"]
        
    admin_headers = {"Authorization": f"Bearer {shared_data['admin_token']}"} if shared_data["admin_token"] else {}

    run_test("TC-06", "Quan tri vien", "Admin lay thong tin ca nhan me", "GET", "/auth/me", headers=admin_headers, expected_status=200)
    run_test("TC-07", "Quan tri vien", "Admin lay danh sach tat ca user", "GET", "/users", headers=admin_headers, expected_status=200)
    run_test("TC-08", "Quan tri vien", "Admin lay danh sach tat ca benh nhan", "GET", "/patients", headers=admin_headers, expected_status=200)
    
    _, doctors_res = run_test("TC-09", "Quan tri vien", "Admin lay danh sach tat ca bac si", "GET", "/doctors", headers=admin_headers, expected_status=200)
    if doctors_res and doctors_res.get("success") and doctors_res.get("data"):
        doc_list = doctors_res["data"]
        for doc in doc_list:
            if doc.get("email") == "doctor@vinamec.vn":
                shared_data["doctor_id"] = doc["_id"]
                shared_data["doctor_user_id"] = doc["user"]
                print(f"    Resolved Doctor ID: {shared_data['doctor_id']}, User ID: {shared_data['doctor_user_id']}")
                break
        if not shared_data["doctor_id"] and len(doc_list) > 0:
            shared_data["doctor_id"] = doc_list[0]["_id"]
            shared_data["doctor_user_id"] = doc_list[0]["user"]

    run_test("TC-10", "Quan tri vien", "Admin xem danh sach ca lam viec (Shifts)", "GET", "/shifts", headers=admin_headers, expected_status=200)
    run_test("TC-11", "Quan tri vien", "Admin xem danh sach tat ca lich hen", "GET", "/appointments", headers=admin_headers, expected_status=200)
    run_test("TC-12", "Quan tri vien", "Admin xem thong ke so lieu lich hen", "GET", "/appointments/stats", headers=admin_headers, expected_status=200)
    run_test("TC-13", "Quan tri vien", "Admin xem danh sach tat ca benh an", "GET", "/records", headers=admin_headers, expected_status=200)
    run_test("TC-14", "Quan tri vien", "Admin xem danh sach tat ca diem rang mieng", "GET", "/scores", headers=admin_headers, expected_status=200)

    # --------------------------------------------------------------------------
    # GROUP 3: DOCTOR APIS
    # --------------------------------------------------------------------------
    doctor_login_payload = {
        "email": DOCTOR_CREDENTIALS["email"],
        "password": DOCTOR_CREDENTIALS["password"]
    }
    status, doc_login_res = run_test("TC-15", "Bac si", "Dang nhap tai khoan Bac si", "POST", "/auth/login", payload=doctor_login_payload, expected_status=200)
    if status == "PASS" and doc_login_res and doc_login_res.get("success"):
        shared_data["doctor_token"] = doc_login_res["data"]["token"]
        
    doc_headers = {"Authorization": f"Bearer {shared_data['doctor_token']}"} if shared_data["doctor_token"] else {}

    run_test("TC-16", "Bac si", "Bac si lay thong tin tai khoan cua minh", "GET", "/auth/me", headers=doc_headers, expected_status=200)
    run_test("TC-17", "Bac si", "Bac si lay thong tin ho so chuyen mon", "GET", "/doctors/me", headers=doc_headers, expected_status=200)
    run_test("TC-18", "Bac si", "Bac si xem danh sach benh nhan phụ trach", "GET", "/doctors/patients", headers=doc_headers, expected_status=200)
    
    # Register tomorrow morning shift dynamically to ensure booking works
    shift_payload = {
        "date": shared_data["tomorrow_date"],
        "shiftType": "morning",
        "maxPatients": 8,
        "notes": "Ca truc thu nghiem tu dong tu Python"
    }
    status, shift_res = run_test("TC-19", "Bac si", "Bac si dang ky ca truc ngay mai", "POST", "/shifts", payload=shift_payload, headers=doc_headers, expected_status=201)
    if status == "PASS" and shift_res and shift_res.get("success"):
        shared_data["shift_id"] = shift_res["data"]["_id"]
        print(f"    Shift created dynamically: ID {shared_data['shift_id']}")

    # --------------------------------------------------------------------------
    # GROUP 4: PATIENT APIS
    # --------------------------------------------------------------------------
    patient_login_payload = {
        "email": PATIENT_CREDENTIALS["email"],
        "password": PATIENT_CREDENTIALS["password"]
    }
    status, pat_login_res = run_test("TC-20", "Benh nhan", "Dang nhap tai khoan Benh nhan", "POST", "/auth/login", payload=patient_login_payload, expected_status=200)
    if status == "PASS" and pat_login_res and pat_login_res.get("success"):
        shared_data["patient_token"] = pat_login_res["data"]["token"]
        shared_data["patient_user_id"] = pat_login_res["data"]["user"]["_id"]
        print(f"    Patient User ID: {shared_data['patient_user_id']}")
        
    pat_headers = {"Authorization": f"Bearer {shared_data['patient_token']}"} if shared_data["patient_token"] else {}

    run_test("TC-21", "Benh nhan", "Benh nhan lay thong tin tai khoan", "GET", "/auth/me", headers=pat_headers, expected_status=200)
    run_test("TC-22", "Benh nhan", "Benh nhan xem lich hen ca nhan", "GET", "/appointments/me", headers=pat_headers, expected_status=200)
    run_test("TC-23", "Benh nhan", "Benh nhan xem benh an ca nhan", "GET", "/records/me", headers=pat_headers, expected_status=200)
    run_test("TC-24", "Benh nhan", "Benh nhan xem diem rang mieng ca nhan", "GET", "/scores/me", headers=pat_headers, expected_status=200)
    
    # Query slots
    if shared_data["doctor_id"]:
        slots_endpoint = f"/appointments/slots?doctorId={shared_data['doctor_id']}&date={shared_data['tomorrow_date']}"
        run_test("TC-25", "Benh nhan", "Benh nhan tra cuu ca truc bac si", "GET", slots_endpoint, headers=pat_headers, expected_status=200)

        # Book appointment
        booking_payload = {
            "doctorId": shared_data["doctor_id"],
            "serviceId": shared_data["service_id"],
            "date": shared_data["tomorrow_date"],
            "shiftType": "morning",
            "notes": "Dat hen kiem tra rang mieng tu dong"
        }
        status, appt_res = run_test("TC-26", "Benh nhan", "Benh nhan dat lich hen kham moi", "POST", "/appointments", payload=booking_payload, headers=pat_headers, expected_status=201)
        if status == "PASS" and appt_res and appt_res.get("success"):
            shared_data["appointment_id"] = appt_res["data"]["_id"]
            print(f"    Appointment booked dynamically: ID {shared_data['appointment_id']}")
            
    pat_chat_payload = {"message": "Toi bi nhuc rang khon hàm duoi thi lam sao?"}
    run_test("TC-27", "Benh nhan", "Benh nhan chat rieng tu voi AI tu van", "POST", "/chat/private", payload=pat_chat_payload, headers=pat_headers, expected_status=200)

    # --------------------------------------------------------------------------
    # GROUP 5: DOCTOR APPOINTMENT & DENTAL SCORE MANAGEMENT
    # --------------------------------------------------------------------------
    if shared_data["appointment_id"]:
        # Approve appointment
        approve_endpoint = f"/appointments/{shared_data['appointment_id']}/approve"
        run_test("TC-28", "Bac si", "Bac si phe duyet lich hen cua benh nhan", "PUT", approve_endpoint, payload={"notes": "Approved by API Test Script"}, headers=doc_headers, expected_status=200)
        
        # Complete appointment (resolves invoice payment automatically)
        complete_endpoint = f"/appointments/{shared_data['appointment_id']}/complete"
        run_test("TC-29", "Bac si", "Bac si hoan thanh kham & tu dong xuat hoa don", "PUT", complete_endpoint, payload={"notes": "Completed test treatment"}, headers=doc_headers, expected_status=200)

    # Update patient score
    if shared_data["patient_user_id"]:
        score_endpoint = f"/scores/patient/{shared_data['patient_user_id']}"
        score_payload = {
            "overall": 88,
            "gumHealth": 85,
            "toothDecay": 90,
            "alignment": 85,
            "cleanliness": 92,
            "recommendations": ["Danh rang sau khi an", "Kham dinh ky 6 thang/lan"],
            "nextCheckupDate": (datetime.now() + timedelta(days=180)).strftime("%Y-%m-%d"),
            "historyNote": "Kham hoan thanh, cap nhat diem moi"
        }
        run_test("TC-30", "Bac si", "Bac si cap nhat diem rang mieng benh nhan", "PUT", score_endpoint, payload=score_payload, headers=doc_headers, expected_status=200)

    # --------------------------------------------------------------------------
    # GROUP 6: PATIENT RE-VERIFICATION
    # --------------------------------------------------------------------------
    run_test("TC-31", "Benh nhan", "Benh nhan kiem tra lai diem sau cap nhat", "GET", "/scores/me", headers=pat_headers, expected_status=200)

    print("\n" + "=" * 80)
    print("🎉 ALL INTEGRATION API TESTS COMPLETED! 🎉")
    print("=" * 80)
    
    export_to_excel()

# ==============================================================================
# 6. EXCEL REPORT GENERATOR (PREMIUM DESIGN WITH EXCEL GRAPHICAL WRITER)
# ==============================================================================
def export_to_excel():
    excel_filename = "api_test_results.xlsx"
    print(f"\n[+] Exporting styled Excel report to: {excel_filename}...")
    
    df = pd.DataFrame(test_results)
    
    # 1. Create workbook & set options
    wb = Workbook()
    ws = wb.active
    ws.title = "Báo cáo Kiểm thử API"
    
    # Keep grid lines visible
    ws.views.sheetView[0].showGridLines = True
    
    # 2. Premium Color Palette Definitions (Deep Blue/Slate Premium)
    NAVY_DARK = "1E3A8A"      # Primary Brand Navy
    NAVY_LIGHT = "F3F4F6"     # Light background for Zebra striping
    WHITE = "FFFFFF"
    
    GREEN_FILL = "DCFCE7"     # Soft Pastel Green for PASS
    GREEN_FONT = "15803D"     # Bold Dark Green text
    
    RED_FILL = "FEE2E2"       # Soft Pastel Red for FAIL
    RED_FONT = "B91C1C"       # Bold Dark Red text
    
    GREY_LIGHT = "F9FAFB"     # Summary Background
    GREY_BORDER = "E5E7EB"    # Clean border lines
    
    # Fonts
    font_main_title = Font(name="Arial", size=15, bold=True, color=WHITE)
    font_section = Font(name="Arial", size=11, bold=True, color="1F2937")
    font_header = Font(name="Arial", size=10, bold=True, color=WHITE)
    font_body = Font(name="Arial", size=10, color="374151")
    font_bold_body = Font(name="Arial", size=10, bold=True, color="111827")
    
    fill_main_title = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type="solid")
    fill_header = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type="solid")
    fill_zebra = PatternFill(start_color=NAVY_LIGHT, end_color=NAVY_LIGHT, fill_type="solid")
    fill_summary = PatternFill(start_color=GREY_LIGHT, end_color=GREY_LIGHT, fill_type="solid")
    
    thin_side = Side(border_style="thin", color=GREY_BORDER)
    border_all = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    
    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    
    # ==========================================================================
    # A. MERGED MAIN TITLE BLOCK (Rows 1 to 2)
    # ==========================================================================
    ws.merge_cells("A1:J2")
    title_cell = ws["A1"]
    title_cell.value = "VINAMEC DENTAL CARE - KẾT QUẢ KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG API HỆ THỐNG"
    title_cell.font = font_main_title
    title_cell.fill = fill_main_title
    title_cell.alignment = align_center
    
    # Fill border/background for merged cells properly
    for r in range(1, 3):
        for c in range(1, 11):
            ws.cell(row=r, column=c).border = border_all
            ws.cell(row=r, column=c).fill = fill_main_title
            
    ws.row_dimensions[1].height = 20
    ws.row_dimensions[2].height = 20

    # ==========================================================================
    # B. DASHBOARD SUMMARY CARD (Rows 4 to 6)
    # ==========================================================================
    total_tests = len(df)
    passed_tests = len(df[df["Kết Quả"] == "PASS"]) if total_tests > 0 else 0
    failed_tests = len(df[df["Kết Quả"] == "FAIL"]) if total_tests > 0 else 0
    pass_rate = round((passed_tests / total_tests) * 100, 1) if total_tests > 0 else 0.0

    ws["A4"] = "THÔNG TIN CHUNG BÁO CÁO"
    ws["A4"].font = font_section
    
    summary_labels = [
        ("Tổng số ca kiểm thử", total_tests),
        ("Đã vượt qua (PASS)", passed_tests),
        ("Thất bại (FAIL)", failed_tests),
        ("Tỷ lệ thành công", f"{pass_rate}%")
    ]
    
    for idx, (label, val) in enumerate(summary_labels):
        col_lbl = chr(65 + idx * 2)       # A, C, E, G
        col_val = chr(66 + idx * 2)       # B, D, F, H
        
        ws[f"{col_lbl}5"] = label
        ws[f"{col_lbl}5"].font = font_body
        ws[f"{col_lbl}5"].fill = fill_summary
        ws[f"{col_lbl}5"].border = border_all
        ws[f"{col_lbl}5"].alignment = align_left
        
        ws[f"{col_val}5"] = val
        ws[f"{col_val}5"].font = font_bold_body
        ws[f"{col_val}5"].fill = fill_summary
        ws[f"{col_val}5"].border = border_all
        ws[f"{col_val}5"].alignment = align_center
        
        ws.merge_cells(f"{col_lbl}5:{col_lbl}6")
        ws.merge_cells(f"{col_val}5:{col_val}6")
        
        ws[f"{col_lbl}6"].border = border_all
        ws[f"{col_lbl}6"].fill = fill_summary
        ws[f"{col_val}6"].border = border_all
        ws[f"{col_val}6"].fill = fill_summary

    # Timing / Metadata info on right-side
    ws["I5"] = "Thời gian xuất:"
    ws["I5"].font = font_body
    ws["I5"].alignment = align_right
    
    ws["J5"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ws["J5"].font = font_bold_body
    ws["J5"].alignment = align_left
    
    ws["I6"] = "Môi trường:"
    ws["I6"].font = font_body
    ws["I6"].alignment = align_right
    
    ws["J6"] = "Localhost Dev"
    ws["J6"].font = font_bold_body
    ws["J6"].alignment = align_left

    ws.row_dimensions[5].height = 20
    ws.row_dimensions[6].height = 20

    # ==========================================================================
    # C. DETAILED API TEST RESULTS TABLE
    # ==========================================================================
    ws["A8"] = "CHI TIẾT KẾT QUẢ TỪNG BÀI KIỂM THỬ"
    ws["A8"].font = font_section

    headers = [
        "Mã số", "Nhóm chức năng", "Tên chức năng kiểm thử", 
        "Phương thức", "Đường dẫn (Endpoint)", "Kỳ vọng", 
        "Thực tế", "Kết quả", "Thời gian (s)", "Chi tiết phản hồi từ Server"
    ]
    
    start_row = 9
    
    for col_idx, header_text in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=col_idx)
        cell.value = header_text
        cell.font = font_header
        cell.fill = fill_header
        cell.border = border_all
        cell.alignment = align_center
        
    ws.row_dimensions[start_row].height = 26

    # Populate Data
    current_row = start_row + 1
    for i, row_data in df.iterrows():
        values = [
            row_data["ID"],
            row_data["Nhóm"],
            row_data["Chức Năng"],
            row_data["Phương Thức"],
            row_data["Endpoint"],
            row_data["Kỳ Vọng"],
            row_data["Thực Tế"],
            row_data["Kết Quả"],
            row_data["Thời Gian (s)"],
            row_data["Chi Tiết"]
        ]
        
        is_even = (i % 2 == 0)
        
        for col_idx, val in enumerate(values, 1):
            cell = ws.cell(row=current_row, column=col_idx)
            cell.value = val
            cell.font = font_body
            cell.border = border_all
            
            # Alignments
            if col_idx in [1, 4, 6, 7, 8]:
                cell.alignment = align_center
            elif col_idx in [9]:
                cell.alignment = align_right
            else:
                cell.alignment = align_left
                
            # Zebra striping
            if is_even:
                cell.fill = fill_zebra
                
            # PASS/FAIL high-end graphics colors
            if col_idx == 8:
                if val == "PASS":
                    cell.fill = PatternFill(start_color=GREEN_FILL, end_color=GREEN_FILL, fill_type="solid")
                    cell.font = Font(name="Arial", size=10, bold=True, color=GREEN_FONT)
                else:
                    cell.fill = PatternFill(start_color=RED_FILL, end_color=RED_FILL, fill_type="solid")
                    cell.font = Font(name="Arial", size=10, bold=True, color=RED_FONT)
                    
        ws.row_dimensions[current_row].height = 24
        current_row += 1

    # ==========================================================================
    # D. AUTO-FIT COLUMN WIDTHS & CELL WRAPPING
    # ==========================================================================
    column_widths = {
        1: 10,   # ID
        2: 18,   # Nhóm
        3: 35,   # Chức năng
        4: 12,   # Phương thức
        5: 35,   # Endpoint
        6: 12,   # Kỳ vọng
        7: 12,   # Thực tế
        8: 12,   # Kết quả
        9: 14,   # Thời gian
        10: 60   # Response details (wrap text)
    }

    for col_idx, width in column_widths.items():
        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = width
        
    # Enable word wrap for the long response column
    for row in range(start_row + 1, current_row):
        ws.cell(row=row, column=10).alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    # Save
    try:
        wb.save(excel_filename)
        print(f"[OK] Created styled Excel report successfully: '{os.path.abspath(excel_filename)}'")
        print(f"     Report contains {total_tests} test cases.")
    except Exception as e:
        print(f"[ERROR] Failed to save Excel file: {e}")

# ==============================================================================
# 7. MAIN FUNCTION
# ==============================================================================
if __name__ == "__main__":
    execute_test_suite()
