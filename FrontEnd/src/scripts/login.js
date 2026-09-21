document.addEventListener('DOMContentLoaded', () => {
    mudarCard()
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