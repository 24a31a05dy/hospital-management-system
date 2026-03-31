// Billing management

document.addEventListener("DOMContentLoaded", () => {
    const { STORAGE_KEYS, getFromStorage, setInStorage, generateId, getCurrentUser, formatDate, escapeHtml } = window.HMSUtils;
    const currentUser = getCurrentUser();

    const billingForm = document.getElementById("billingForm");
    const billingTableBody = document.getElementById("billingTableBody");
    const totalAmountEl = document.getElementById("billingTotalAmount");

    function loadBilling() {
        let records = getFromStorage(STORAGE_KEYS.BILLING, []);
        if (currentUser && currentUser.role === "patient") {
            records = records.filter(r => r.patientId === currentUser.id || r.patientName === currentUser.name);
        }

        if (billingTableBody) {
            billingTableBody.innerHTML = "";
            let total = 0;
            records.forEach(rec => {
                total += rec.amount || 0;
                const tr = document.createElement("tr");
                const safePatient = escapeHtml(rec.patientName);
                const safeServices = escapeHtml(rec.services.join(", "));
                const safeDate = formatDate(rec.date);
                tr.innerHTML = `
                    <td>${safePatient}</td>
                    <td>${safeServices}</td>
                    <td>$${rec.amount.toFixed(2)}</td>
                    <td>${safeDate}</td>
                `;
                billingTableBody.appendChild(tr);
            });

            if (totalAmountEl) {
                totalAmountEl.textContent = `$${total.toFixed(2)}`;
            }
        }
    }

    if (billingForm && currentUser && (currentUser.role === "admin" || currentUser.role === "receptionist")) {
        billingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const patientNameInput = document.getElementById("billingPatientName");
            const servicesInput = document.getElementById("billingServices");
            const amountInput = document.getElementById("billingAmount");

            const patientName = patientNameInput.value.trim();
            const servicesRaw = servicesInput.value.trim();
            const amount = parseFloat(amountInput.value);

            if (!patientName || !servicesRaw || isNaN(amount)) {
                alert("Please enter patient, services, and valid amount.");
                return;
            }

            const services = servicesRaw.split(",").map(s => s.trim()).filter(Boolean);

            const record = {
                id: generateId("bill"),
                patientId: null,
                patientName,
                services,
                amount,
                date: new Date().toISOString()
            };

            const records = getFromStorage(STORAGE_KEYS.BILLING, []);
            records.push(record);
            setInStorage(STORAGE_KEYS.BILLING, records);
            e.target.reset();
            loadBilling();
        });
    }

    loadBilling();
});

