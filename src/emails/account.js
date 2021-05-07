const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name = 'Berke') => {

    sgMail.send({
        to: email,
        from: 'berke.oztekn@gmail.com',
        subject: 'Thank you for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })

}


const sendCancelationMail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'berke.oztekn@gmail.com',
        subject: `You delete your account, ${name} :(`,
        text: 'Is there a way to keep you on board? (:'
    })

}


module.exports = {
    sendWelcomeEmail,
    sendCancelationMail
}