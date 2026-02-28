import { notifyOwner } from "./notification";

export async function notifyAdminNewRequest(
  requestId: number,
  type: string,
  pickupLocation: string,
  deliveryLocation: string,
  orderNumber?: string,
  pickupCode?: string
) {
  try {
    const isAccepted = orderNumber && pickupCode;
    const title = isAccepted ? `Pedido Aceito - ${type}` : `Nova solicitação de ${type}`;
    
    let content = `
      ID: ${requestId}
      Tipo: ${type}
      De: ${pickupLocation}
      Para: ${deliveryLocation}`;
    
    if (isAccepted) {
      content += `
      Número do Pedido: ${orderNumber}
      Código de Coleta: ${pickupCode}
      
      CHAMAR MOTOBOY PARA ESTE PEDIDO!`;
    } else {
      content += `
      
      Acesse o painel para responder a solicitação.`;
    }

    // Send in-app notification to admin
    await notifyOwner({
      title,
      content,
    });

    // Send email notification
    await sendEmailNotification(title, content);

    console.log(`[Notification] Admin notified about request ${requestId}`);
  } catch (error) {
    console.error("[Notification] Failed to notify admin:", error);
  }
}

async function sendEmailNotification(subject: string, message: string) {
  try {
    // Simulação de envio de email
    console.log(`[Email] Sending email: ${subject}`);
    console.log(`[Email] Message: ${message}`);
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
  }
}
