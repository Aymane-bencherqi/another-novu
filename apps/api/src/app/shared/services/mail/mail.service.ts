import sgApi from '@sendgrid/mail';

export type IEmailRecipient = string | { name?: string; email: string };

export interface ISendMail {
  to: IEmailRecipient | IEmailRecipient[];
  from: {
    name: string;
    email: string;
  };
  subject?: string;
  text?: string;
  html?: string;
  templateId?: string;
  params?: {
    [key: string]: string | any[] | any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  attachments?: Array<{
    content: string; // base64
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

export class MailService {
  private sendgrid = sgApi;

  constructor() {
    this.sendgrid.setApiKey(process.env.SENDGRID_API_KEY ?? '');
  }

  async sendMail(mail: ISendMail) {
    if (!mail.templateId && !mail.subject) throw new Error('Either templateId or subject must be present');
    if (process.env.NODE_ENV === 'test') return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mailObject: any = {
      subject: mail.subject,
      dynamicTemplateData: mail.params,
      to: mail.to,
      from: {
        name: mail.from.name,
        email: mail.from.email,
      },
      templateId: undefined,
      attachments: mail.attachments,
    };

    if (mail.templateId) {
      mailObject.templateId = mail.templateId;
    }

    if (mail.text) {
      mailObject.text = mail.text;
    }

    if (mail.html) {
      mailObject.html = mail.html;
    }

    return await this.sendgrid.send(mailObject, false);
  }
}
