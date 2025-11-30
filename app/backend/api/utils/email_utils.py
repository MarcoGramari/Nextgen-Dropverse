# email_utils.py - envelope simples (opcional)
import smtplib
from email.message import EmailMessage
from config import Config

def send_email(to_email, subject, body):
    if not Config.MAIL_USERNAME or not Config.MAIL_PASSWORD:
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = Config.MAIL_USERNAME
    msg["To"] = to_email
    msg.set_content(body)
    try:
        server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT)
        server.starttls()
        server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception:
        return False
