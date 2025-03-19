import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'send.smtp.mailtrap.io',
    port: 587,
    secure: false,
    auth: {
        user: 'api', 
        pass: '15101f65a253361240971260cf04921b'
    }
});

async function mandaemail(dest, nome) {
    const info = await transporter.sendMail({
        from: 'info@demomailtrap.co',
        to: dest,
        subject: "Notifica",
        text: `Ciao ${nome},  \nBenvenuto/a su SumDoc! 🎉  \n\nSiamo entusiasti di averti nella nostra community. Da oggi hai accesso a una vasta dispensa di documenti in preparazione all'esame, e siamo qui per aiutarti a ottenere il massimo dalla tua esperienza.  \n\nCosa puoi fare ora?  \n✅ Esplora le nostre funzionalità  \n✅ Personalizza il tuo profilo  \n✅ Contatta il nostro team per qualsiasi domanda  \n\nSe hai bisogno di assistenza, non esitare a scriverci a alessandroaxhenti@gmail.com.  \nA presto e buon divertimento! 🚀  \nIl team di SumDoc`,
    });

    console.log("Email inviata:", info.messageId);
}

export default mandaemail;
