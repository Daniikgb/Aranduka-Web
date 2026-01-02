// js/admin.js

document.addEventListener('DOMContentLoaded', function () {
    console.log("Admin Panel Loaded");

    // Load initial data
    loadDashboardData();

    // Tab Navigation
    $('.nav-link-admin').click(function (e) {
        e.preventDefault();
        $('.nav-link-admin').removeClass('active');
        $(this).addClass('active');

        const target = $(this).data('target');
        if (target) {
            $('.admin-section').hide();
            $('#' + target).fadeIn();
        }
    });



    // Handle Edit Book Form
    const editForm = document.getElementById('adminEditBookForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch('backend/editar_libro.php', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Actualizado', 'Datos del libro modificados.', 'success');
                        $('#editBookModal').modal('hide');
                        loadDashboardData();
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                });
        });
    }
});

function loadDashboardData() {
    fetch('backend/admin_dashboard.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                console.error("Error fetching admin data:", data.message);
                return;
            }

            // 1. Stats
            document.getElementById('totalUsers').innerText = data.stats.users || 0;
            document.getElementById('totalBooks').innerText = data.users_list ? data.users_list.length : 0; // Fallback logic if books count not sent directly
            if (data.stats.pending) document.getElementById('pendingUploads').innerText = data.stats.pending;

            // 2. Pending Uploads (Aportes)
            renderPendingTable(data.aportes_list);

            // 3. Books List
            fetch('backend/get_books.php').then(r => r.json()).then(bookData => {
                if (bookData.success) {
                    renderBooksTable(bookData.data);
                    document.getElementById('totalBooks').innerText = bookData.data.length;
                }
            });

            // 4. Users List
            renderUsersTable(data.users_list);

        })
        .catch(err => console.error("Fetch error:", err));
}

// RENDER: Approvals
function renderPendingTable(aportes) {
    const tbody = document.getElementById('pendingTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const pending = aportes.filter(a => a.estado === 'pendiente');

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay aportes pendientes.</td></tr>';
        return;
    }

    pending.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>${a.autor_nombre || 'Desconocido'}</td>
                <td>${a.titulo}</td>
                <td><span class="badge badge-info">${a.categoria}</span></td>
                <td>${new Date(a.fecha_subida).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="approveAporte(${a.id})"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="rejectAporte(${a.id})"><i class="fas fa-times"></i></button>
                    <a href="${a.archivo_url}" target="_blank" class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i></a>
                </td>
            </tr>
        `;
    });
}

function approveAporte(id) {
    Swal.fire({
        title: '¿Aprobar Material?',
        text: "Será visible en la sección Comunidad.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, aprobar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('backend/aprobar_aporte.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            })
                .then(() => {
                    Swal.fire('Aprobado', '', 'success');
                    loadDashboardData();
                });
        }
    });
}

// RENDER: Books
function renderBooksTable(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    books.forEach(b => {
        // SYSTEM PROTECTION LOGIC
        const isSystem = (b.es_sistema == 1);
        const actionButtons = isSystem
            ? `<span class="badge badge-secondary"><i class="fas fa-lock"></i> Sistema</span>`
            : `
                <button class="btn btn-sm btn-warning" onclick='openEditBook(${JSON.stringify(b)})'><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteBook(${b.id})"><i class="fas fa-trash"></i></button>
              `;

        tbody.innerHTML += `
            <tr>
                <td>${b.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${b.image}" width="30" height="40" class="mr-2 rounded">
                        <span>${b.title}</span>
                    </div>
                </td>
                <td>${b.category}</td>
                <td>${b.level}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    });
}

function deleteBook(id) {
    Swal.fire({
        title: '¿Eliminar libro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('backend/eliminar_libro.php', {
                method: 'POST',
                body: JSON.stringify({ id: id }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Eliminado', data.message, 'success');
                        loadDashboardData();
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                });
        }
    });
}

function openEditBook(bookJson) {
    // bookJson object might be passed as string if not careful, but JSON.stringify in HTML attribute works
    // However, clean JS object passing is tricky in inline HTML. 
    // We will trust the JSON parse execution implicitly or fix logic if needed. 
    // Actually, passing object in onclick HTML is risky with quotes. 
    // Better fetch or find from global list. But for MVP:

    // We can use the global scope since it's an admin panel
    $('#editBookId').val(bookJson.id);
    $('#editBookTitle').val(bookJson.title);
    $('#editBookAuthor').val(bookJson.author);
    $('#editBookCategory').val(bookJson.category);
    $('#editBookLevel').val(bookJson.level);
    $('#editBookDesc').val(bookJson.description);

    $('#editBookModal').modal('show');
}


// RENDER: Users
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBodyFull');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay usuarios.</td></tr>';
        return;
    }

    users.forEach(u => {
        // Download History formatted
        let downloadsHtml = '<small class="text-muted">Sin descargas recientes</small>';
        if (u.historial_descargas && u.historial_descargas.length > 0) {
            downloadsHtml = '<ul class="pl-3 mb-0" style="font-size:0.85rem">';
            u.historial_descargas.forEach(h => {
                downloadsHtml += `<li>${h.libro_titulo} <span class="text-muted">(${new Date(h.fecha_descarga).toLocaleDateString()})</span></li>`;
            });
            downloadsHtml += '</ul>';
        }

        tbody.innerHTML += `
            <tr>
                <td>#${u.id}</td>
                <td>
                    <strong>${u.nombre_completo}</strong><br>
                    <small>${u.colegio || 'Sin colegio'}</small>
                </td>
                <td>
                    ${u.email}<br>
                    <small>CI: ${u.ci}</small>
                </td>
                <td>
                    ${downloadsHtml}
                </td>
                <td>
                   <span class="badge badge-${u.rol === 'admin' ? 'danger' : 'secondary'}">${u.rol}</span>
                </td>
            </tr>
        `;
    });
}
