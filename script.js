// Lista de turmas (arquivos da pasta classes/)
let classes = [];

async function loadClasses() {
    try {
        const response = await fetch('classes-list.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar lista de turmas');
        }
        const data = await response.json();
        classes = data.classes;
        console.log('Turmas carregadas:', classes);
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        showError('Erro ao carregar a lista de turmas');

        // Fallback: tentar detectar automaticamente (limitações)
        try {
            classes = await tryDetectClasses();
        } catch (detectError) {
            console.error('Também falhou na detecção automática:', detectError);
        }
    }
}

// Tentar detectar turmas automaticamente (solução limitada)
async function tryDetectClasses() {
    // Lista de turmas comuns para fallback
    const commonClasses = [
        "Turma-A-2024", "Turma-B-2024", "Turma-C-2024",
        "Turma-Avancada-2024", "Turma-Iniciantes-2024"
    ];

    // Verificar quais arquivos existem (apenas alguns)
    const existingClasses = [];

    for (const className of commonClasses) {
        const exists = await checkFileExists(`classes/${className}.html`);
        if (exists) {
            existingClasses.push(className);
        }
    }

    return existingClasses.length > 0 ? existingClasses : commonClasses;
}

// Verificar se um arquivo existe (método limitado)
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Configurar autocomplete
function setupAutocomplete() {
    const searchInput = document.getElementById('classSearch');
    const resultsContainer = document.getElementById('autocompleteResults');

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.trim().toLowerCase();
        showAutocompleteResults(searchTerm);
    });

    searchInput.addEventListener('focus', function () {
        const searchTerm = this.value.trim().toLowerCase();
        if (searchTerm.length > 0) {
            showAutocompleteResults(searchTerm);
        }
    });

    // Fechar autocomplete ao clicar fora
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            hideAutocomplete();
        }
    });

    // Navegação por teclado
    searchInput.addEventListener('keydown', function (e) {
        const items = resultsContainer.querySelectorAll('.autocomplete-item:not(.autocomplete-empty)');
        let activeItem = resultsContainer.querySelector('.autocomplete-item.active');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateAutocomplete(items, 'down', activeItem);
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateAutocomplete(items, 'up', activeItem);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    selectAutocompleteItem(activeItem);
                } else if (items.length > 0) {
                    selectAutocompleteItem(items[0]);
                }
                break;
            case 'Escape':
                hideAutocomplete();
                searchInput.blur();
                break;
        }
    });
}

// Mostrar resultados do autocomplete
function showAutocompleteResults(searchTerm) {
    const resultsContainer = document.getElementById('autocompleteResults');
    resultsContainer.innerHTML = '';

    if (searchTerm.length === 0) {
        hideAutocomplete();
        return;
    }

    const filteredClasses = classes.filter(className =>
        className.toLowerCase().includes(searchTerm)
    );

    if (filteredClasses.length > 0) {
        filteredClasses.forEach(className => {
            const resultItem = document.createElement('div');
            resultItem.className = 'autocomplete-item';
            resultItem.innerHTML = className;
            resultItem.onclick = () => selectAutocompleteItem(resultItem);
            resultsContainer.appendChild(resultItem);
        });
    } else {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'autocomplete-item autocomplete-empty';
        emptyItem.textContent = 'Nenhuma turma encontrada';
        resultsContainer.appendChild(emptyItem);
    }

    resultsContainer.classList.add('show');
}

// Esconder autocomplete
function hideAutocomplete() {
    const resultsContainer = document.getElementById('autocompleteResults');
    resultsContainer.classList.remove('show');
}

// Navegar no autocomplete com teclado
function navigateAutocomplete(items, direction, activeItem) {
    if (items.length === 0) return;

    items.forEach(item => item.classList.remove('active'));

    if (!activeItem) {
        items[direction === 'down' ? 0 : items.length - 1].classList.add('active');
    } else {
        const currentIndex = Array.from(items).indexOf(activeItem);
        let newIndex;

        if (direction === 'down') {
            newIndex = (currentIndex + 1) % items.length;
        } else {
            newIndex = (currentIndex - 1 + items.length) % items.length;
        }

        items[newIndex].classList.add('active');
        items[newIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Selecionar item do autocomplete
function selectAutocompleteItem(item) {
    if (item.classList.contains('autocomplete-empty')) return;

    const className = item.textContent;
    const searchInput = document.getElementById('classSearch');

    searchInput.value = className;
    hideAutocomplete();
    openClassPage(className);
}

// Abrir página da turma
function openClassPage(className) {
    // Remove caracteres especiais e cria nome de arquivo seguro
    const safeFileName = className.replace(/[^a-zA-Z0-9-_.]/g, '');
    window.location.href = `classes/${safeFileName}.html`;
}

// Mostrar erro
function showError(message) {
    // Poderia implementar um toast ou mensagem de erro
    console.error('Erro:', message);
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', function () {
    loadClasses();
    setupAutocomplete();

    // Focar no input automaticamente
    setTimeout(() => {
        document.getElementById('classSearch').focus();
    }, 500);
});
