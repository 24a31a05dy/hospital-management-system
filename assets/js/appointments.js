// Appointment management

document.addEventListener("DOMContentLoaded", () => {
    const { STORAGE_KEYS, getFromStorage, setInStorage, generateId, getCurrentUser, formatDateTime, escapeHtml } = window.HMSUtils;

    const currentUser = getCurrentUser();
    const isPatient = currentUser && currentUser.role === "patient";
    const isDoctor = currentUser && currentUser.role === "doctor";
    const isAdmin = currentUser && currentUser.role === "admin";
    const isReception = currentUser && currentUser.role === "receptionist";

    const appointmentsTableBody = document.getElementById("appointmentsTableBody");
    const appointmentForm = document.getElementById("appointmentForm");
    const statusSelectsContainer = document.getElementById("appointmentStatusContainer");

    function loadAppointments() {
        let appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS, []);

        if (isPatient) {
            // Prefer ID match, but fall back to name match for legacy records
            appointments = appointments.filter(a => a.patientId === currentUser.id || a.patientName === currentUser.name);
        } else if (isDoctor) {
            appointments = appointments.filter(a => a.doctorId === currentUser.id || a.doctorName === currentUser.name);
        }

        if (appointmentsTableBody) {
            appointmentsTableBody.innerHTML = "";
            appointments.forEach(app => {
                const tr = document.createElement("tr");
                const safePatient = escapeHtml(app.patientName);
                const safeDoctor = escapeHtml(app.doctorName);
                const safeDept = escapeHtml(app.department || "");
                const safeStatus = escapeHtml(app.status);
                const datetime = formatDateTime(app.date, app.time);

                if (isDoctor || isAdmin || isReception) {
                    const select = document.createElement("select");
                    select.className = "status-select";
                    select.setAttribute("data-id", app.id);
                    ["pending", "approved", "completed", "cancelled"].forEach(status => {
                        const opt = document.createElement("option");
                        opt.value = status;
                        opt.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                        if (app.status === status) opt.selected = true;
                        select.appendChild(opt);
                    });

                    tr.innerHTML = `
                        <td>${safePatient}</td>
                        <td>${safeDoctor}</td>
                        <td>${safeDept}</td>
                        <td>${datetime}</td>
                        <td>
                            <span class="status-badge status-${safeStatus}">${safeStatus}</span>
                        </td>
                        <td></td>
                    `;
                    tr.lastElementChild.appendChild(select);
                } else {
                    tr.innerHTML = `
                        <td>${safePatient}</td>
                        <td>${safeDoctor}</td>
                        <td>${safeDept}</td>
                        <td>${datetime}</td>
                        <td>
                            <span class="status-badge status-${safeStatus}">${safeStatus}</span>
                        </td>
                        <td>-</td>
                    `;
                }

                appointmentsTableBody.appendChild(tr);
            });
        }

        if (statusSelectsContainer) {
            statusSelectsContainer.querySelectorAll(".status-select").forEach(sel => {
                sel.addEventListener("change", (e) => {
                    const id = e.target.getAttribute("data-id");
                    updateAppointmentStatus(id, e.target.value);
                });
            });
        } else if (appointmentsTableBody) {
            appointmentsTableBody.querySelectorAll(".status-select").forEach(sel => {
                sel.addEventListener("change", (e) => {
                    const id = e.target.getAttribute("data-id");
                    updateAppointmentStatus(id, e.target.value);
                });
            });
        }
    }

    function updateAppointmentStatus(id, status) {
        let appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS, []);
        const idx = appointments.findIndex(a => a.id === id);
        if (idx !== -1) {
            appointments[idx].status = status;
            setInStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
            loadAppointments();
        }
    }

    if (appointmentForm && (isPatient || isReception || isAdmin)) {
        appointmentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const patientNameInput = document.getElementById("appointmentPatientName");
            const doctorNameInput = document.getElementById("appointmentDoctorName");
            const departmentInput = document.getElementById("appointmentDepartment");
            const dateInput = document.getElementById("appointmentDate");
            const timeInput = document.getElementById("appointmentTime");

            const patientName = patientNameInput.value.trim();
            const doctorName = doctorNameInput.value.trim();
            const department = departmentInput.value.trim();
            const date = dateInput.value;
            const time = timeInput.value;

            if (!patientName || !doctorName || !department || !date || !time) {
                alert("Please fill all appointment fields.");
                return;
            }

            // Determine patientId when created by reception/admin by matching existing patient record
            let patientId = currentUser?.role === "patient" ? currentUser.id : null;
            if (!patientId) {
                const users = getFromStorage(STORAGE_KEYS.USERS, []);
                const matchedPatient = users.find(u => u.role === "patient" && u.name === patientName);
                if (matchedPatient) {
                    patientId = matchedPatient.id;
                }
            }

            const newAppointment = {
                id: generateId("appt"),
                patientId,
                patientName,
                doctorId: null,
                doctorName,
                department,
                date,
                time,
                status: "pending",
                notes: "",
                prescriptions: ""
            };

            const appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS, []);
            appointments.push(newAppointment);
            setInStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
            e.target.reset();
            loadAppointments();
        });
    }

    loadAppointments();
});

