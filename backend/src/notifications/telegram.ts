/**
 * Telegram Notification Service (FREE)
 *
 * Sends real-time trade signals and alerts to a Telegram bot.
 * Setup: Create bot via @BotFather, get TOKEN + CHAT_ID, add to .env
 *
 * Completely free — Telegram Bot API has no cost.
 */

import axios from 'axios';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export type AlertType = 'SIGNAL' | 'TRADE_OPEN' | 'TRADE_CLOSE' | 'EMERGENCY' | 'INFO';

interface TelegramAlert {
  type: AlertType;
  symbol?: string;
  message: string;
}

async function sendMessage(text: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return; // Silently skip if not configured
  try {
    await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML'
    }, { timeout: 5000 });
  } catch (err: any) {
    console.warn('[Telegram] Failed to send message:', err.message);
  }
}

export async function notifySignal(symbol: string, strategy: string, entryPrice: number, targetPrice: number): Promise<void> {
  const msg = [
    `📡 <b>NEW SIGNAL DETECTED</b>`,
    ``,
    `🪙 <b>${symbol}</b>`,
    `📊 Strategy: <code>${strategy}</code>`,
    `💰 Entry: <code>$${entryPrice.toFixed(4)}</code>`,
    `🎯 Target (+1%): <code>$${targetPrice.toFixed(4)}</code>`,
    ``,
    `⏰ ${new Date().toLocaleTimeString()} — ApexCrypto Pro`
  ].join('\n');
  await sendMessage(msg);
}

export async function notifyTradeOpen(symbol: string, strategy: string, mode: string, entryPrice: number, targetPrice: number, qty: number): Promise<void> {
  const emoji = mode === 'LIVE' ? '⚡' : '📝';
  const msg = [
    `${emoji} <b>POSITION OPENED (${mode})</b>`,
    ``,
    `🪙 <b>${symbol}</b>`,
    `📊 Strategy: <code>${strategy}</code>`,
    `💰 Entry: <code>$${entryPrice.toFixed(4)}</code>`,
    `📦 Qty: <code>${qty.toFixed(6)}</code>`,
    `🎯 Target: <code>$${targetPrice.toFixed(4)}</code>`,
    ``,
    `⏰ ${new Date().toLocaleTimeString()} — ApexCrypto Pro`
  ].join('\n');
  await sendMessage(msg);
}

export async function notifyTradeClose(
  symbol: string,
  strategy: string,
  mode: string,
  entryPrice: number,
  exitPrice: number,
  netPnl: number,
  netPnlPct: number,
  reason: string
): Promise<void> {
  const isWin = netPnl >= 0;
  const emoji = isWin ? '✅' : '❌';
  const modeEmoji = mode === 'LIVE' ? '⚡' : '📝';

  const msg = [
    `${emoji} <b>TRADE CLOSED (${mode}) ${modeEmoji}</b>`,
    ``,
    `🪙 <b>${symbol}</b>`,
    `📊 Strategy: <code>${strategy}</code>`,
    `📈 Entry: <code>$${entryPrice.toFixed(4)}</code>`,
    `📉 Exit: <code>$${exitPrice.toFixed(4)}</code>`,
    `💵 Net PnL: <code>${isWin ? '+' : ''}$${netPnl.toFixed(2)} (${netPnlPct.toFixed(2)}%)</code>`,
    `🔖 Reason: <code>${reason}</code>`,
    ``,
    `⏰ ${new Date().toLocaleTimeString()} — ApexCrypto Pro`
  ].join('\n');
  await sendMessage(msg);
}

export async function notifyEmergencyStop(actor: string): Promise<void> {
  const msg = [
    `🚨 <b>EMERGENCY KILL SWITCH ACTIVATED</b>`,
    ``,
    `👤 Actor: <code>${actor}</code>`,
    `All trading halted immediately.`,
    `All open positions being closed.`,
    ``,
    `⏰ ${new Date().toLocaleTimeString()} — ApexCrypto Pro`
  ].join('\n');
  await sendMessage(msg);
}

export async function notifyInfo(message: string): Promise<void> {
  await sendMessage(`ℹ️ <b>ApexCrypto Pro</b>\n\n${message}\n\n⏰ ${new Date().toLocaleTimeString()}`);
}

export function isTelegramConfigured(): boolean {
  return Boolean(TELEGRAM_TOKEN && TELEGRAM_CHAT_ID);
}
