document.addEventListener('DOMContentLoaded', () => {
    mudarCard()
    formatarCPF()
    password()
})

function mudarCard() {
    const btns = document.querySelectorAll('.form-btns__btn')

    btns.forEach((btn) => {
        btn.addEventListener('click', () => {
            btns.forEach((b) => b.classList.remove('active'))
            btn.classList.add('active')
        })
    })
}

function password() {
    const toggleBtn = document.querySelector('#toggleSenha')
    const input = document.querySelector('#senha')

    toggleBtn.addEventListener('click', () => {
        const password = input.getAttribute('type') === 'password'

        input.setAttribute('type', password ? 'text' : 'password')

        toggleBtn.classList.toggle('fa-eye')
        toggleBtn.classList.toggle('fa-eye-slash')
    })
}

function formatarCPF() {
    const cpf = document.getElementById("cpf");

    cpf.addEventListener("input", () => {
        let valor = cpf.value;

        valor = valor.replace(/\D/g, "");
        valor = valor.substring(0, 11);

        if (valor.length > 9) {
            valor = valor.replace(
                /^(\d{3})(\d{3})(\d{3})(\d{1,2})$/,
                "$1.$2.$3-$4"
            );
        } else if (valor.length > 6) {
            valor = valor.replace(
                /^(\d{3})(\d{3})(\d{1,3})$/,
                "$1.$2.$3"
            );
        } else if (valor.length > 3) {
            valor = valor.replace(
                /^(\d{3})(\d{1,3})$/,
                "$1.$2"
            );
        }

        cpf.value = valor;
    });
}