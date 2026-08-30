declare module "mailparser" {
  export interface ParsedMailAddress {
    text?: string;
  }

  export interface ParsedMail {
    from?: ParsedMailAddress;
    to?: ParsedMailAddress;
    subject?: string;
    html?: string | false;
    text?: string;
    messageId?: string;
  }

  export function simpleParser(source: Buffer | string): Promise<ParsedMail>;
}
