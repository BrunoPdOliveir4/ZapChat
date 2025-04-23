import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    
    encrypt(text: string, key: string): string {
        const keyBuffer = crypto.createHash('sha256').update(key).digest();

        const iv = crypto.randomBytes(16); // IV de 16 bytes
        const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted; // Retorna o IV + texto criptografado
    }
    
    decrypt(text: string, key: string): string {
        try {
            // Verifica se o texto criptografado tem tamanho mínimo esperado
            if (text.length < 32) {
                throw new Error('Texto criptografado inválido');
            }
            
            // Extraímos o IV dos primeiros 32 caracteres (16 bytes)
            const iv = Buffer.from(text.slice(0, 32), 'hex');
            const encryptedText = text.slice(32); // O restante é o texto criptografado
            
            // Cria o decodificador com AES-256-CBC
            const keyBuffer = crypto.createHash('sha256').update(key).digest();
            const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
            
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            return "Erro ao decriptar a mensagem";
        }
    }
      
}
