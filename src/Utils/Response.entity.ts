export class ResponseEntity<T> {
    constructor(
      public readonly statusCode: number,
      public readonly message: string,
      public readonly data?: T,
    ) {}
  
    static ok<T>(data: T, message = 'Sucesso'): ResponseEntity<T> {
      return new ResponseEntity(200, message, data);
    }
  
    static created<T>(data: T, message = 'Criado com sucesso'): ResponseEntity<T> {
      return new ResponseEntity(201, message, data);
    }
  
    static updated<T>(data: T, message = 'Atualizado com sucesso'): ResponseEntity<T> {
      return new ResponseEntity(200, message, data);
    }
  
    static deleted(message = 'Removido com sucesso'): ResponseEntity<null> {
      return new ResponseEntity(200, message, null);
    }
  
    static error(message = 'Erro interno', statusCode = 500): ResponseEntity<null> {
      return new ResponseEntity(statusCode, message, null);
    }
}
  