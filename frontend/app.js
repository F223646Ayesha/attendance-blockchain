function loadPage(page) {
    switch (page) {
        case "departments":
            loadDepartmentsPage();
            break;
        case "classes":
            loadClassesPage();
            break;
        case "students":
            loadStudentsPage();
            break;
        case "attendance":
            loadAttendancePage();
            break;
        case "validation":
            loadValidationPage();
            break;
        case "explorer":                // ⬅️ NEW
            loadExplorerPage();
            break;
        default:
            loadDepartmentsPage();
    }
}

// initial load
loadDepartmentsPage();
