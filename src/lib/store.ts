import { SITE } from "@/config/site";
import type { IContactMessage } from "@/models/ContactMessage";
import type { IOrder } from "@/models/Order";
import type { IProduct } from "@/models/Product";
import StoreSettings, { type IStoreSettings } from "@/models/StoreSettings";
import type { Message, Order, Product, Settings } from "@/lib/store-types";

export function serializeProduct(product: IProduct): Product {
  return {
    id: product._id.toString(),
    name: product.name,
    category: product.category,
    image: product.image,
    stock: product.stock,
    price: product.price,
    description: product.description,
    isActive: product.isActive,
  };
}

export function serializeOrder(order: IOrder): Order {
  return {
    id: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    address: order.address,
    date: order.createdAt.toISOString(),
    status: order.status,
    total: order.total,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    adminNotes: order.adminNotes,
  };
}

export function serializeMessage(message: IContactMessage): Message {
  return {
    id: message._id.toString(),
    senderName: message.senderName,
    email: message.email,
    subject: message.subject,
    body: message.body,
    date: message.createdAt.toISOString(),
    unread: message.unread,
  };
}

export function serializeSettings(settings: IStoreSettings): Settings {
  return {
    phone: settings.phone,
    email: settings.email,
    whatsapp: settings.whatsapp,
    address: settings.address,
    notificationEmail: settings.notificationEmail,
    lowStockThreshold: settings.lowStockThreshold,
  };
}

export async function getStoreSettings() {
  let settings = await StoreSettings.findOne({ key: "primary" });

  if (!settings) {
    settings = await StoreSettings.create({
      key: "primary",
      phone: SITE.phone,
      email: SITE.email,
      whatsapp: SITE.whatsapp,
      address: SITE.address,
      notificationEmail: SITE.email,
      lowStockThreshold: 5,
    });
  }

  return settings;
}
