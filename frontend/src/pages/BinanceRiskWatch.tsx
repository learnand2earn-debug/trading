import React, { useState } from 'react';
import { TradingViewModal } from '../components/TradingViewModal.js';

export const BinanceRiskWatch: React.FC<{ navigate: (page: string) => void }> = () => {
  const [selectedChartCoin, setSelectedChartCoin] = useState<string | null>(null);

  const monitoringCoins = [
    { symbol: 'ACT', note: 'Higher-risk monitoring asset' },
    { symbol: 'ARK', note: 'High volatility review tag' },
    { symbol: 'AVA', note: 'Spot monitoring observation' },
    { symbol: 'AWE', note: 'Risk monitoring tag' },
    { symbol: 'BLUR', note: 'Under elevated volatility surveillance' },
    { symbol: 'COOKIE', note: 'Monitoring seed tag' },
    { symbol: 'DODO', note: 'Periodic audit monitoring tag' },
    { symbol: 'FTT', note: 'Special monitoring review' },
    { symbol: 'LUNC', note: 'High volatility surveillance' },
    { symbol: 'USTC', note: 'High risk monitoring' },
    { symbol: 'VGX', note: 'Monitoring status' },
    { symbol: 'WRX', note: 'Monitoring tag review' }
  ];

  const delistingNotices = [
    { title: 'Notice of Removal of Spot Trading Pairs - 2026-10-02', date: 'Published 9/29/2026', badge: 'Notice' },
    { title: 'Notice of Removal of Spot Trading Pairs - 2026-09-25', date: 'Published 9/22/2026', badge: 'Notice' },
    { title: 'Notice of Removal of Spot Trading Pairs - 2026-09-18', date: 'Published 9/16/2026', badge: 'Notice' },
    { title: 'Binance Will Delist USDP on 2026-09-24', date: 'Published 9/10/2026', badge: 'Notice' },
    { title: 'Notice of Removal of Spot Trading Pairs - 2026-09-11', date: 'Published 9/8/2026', badge: 'Notice' },
    { title: 'Binance Will Delist ICX, SCRT, STORJ on 2026-09-03', date: 'Published 8/20/2026', badge: 'Notice' },
    { title: 'Notice of Removal of Spot Trading Pairs - 2026-08-21', date: 'Published 8/18/2026', badge: 'Notice' }
  ];

  const spotNews = [
    { title: "Binance Exchange Adds Adobe (ADBEB), Forward Industries (FWDIB), Hewlett Packard (HPEB), PDD Holdings (PDDB), SharonAI (SHAZB), Wendy's (WENB) and Zoom (ZMB) bStocks Trading Pairs on Binance Spot/Convert - 2026-09-30", date: '9/30/2026', badge: 'Trading Pairs', cls: 'blue' },
    { title: 'Notice of Removal of Spot Trading Pairs - 2026-10-02', date: '9/29/2026', badge: 'Delisting', cls: 'red' },
    { title: 'Binance Margin And Loans Token Delist on 2026-10-02', date: '9/29/2026', badge: 'Delisting', cls: 'red' },
    { title: 'Binance Will List Hyperliquid (HYPE) with Seed Tag Applied', date: '9/24/2026', badge: 'New Listing', cls: 'green' },
    { title: 'Binance Will Close UAH Deposits and Withdrawals via Fiat Trade UAH and Delist USDT/UAH Spot Trading Pair', date: '9/23/2026', badge: 'Delisting', cls: 'red' },
    { title: 'Binance Exchange Adds Axe Compute (AGPUB), AMC Entertainment (AMCB) and Cypherpunk Technologies (CYPHB) bStocks Trading Pairs on Binance Spot/Convert', date: '9/20/2026', badge: 'Trading Pairs', cls: 'blue' }
  ];

  return (
    <div className="content">
      <div className="tab-panel active" id="tab-riskWatch">
        <div className="risk-hero">
          <div>
            <span className="risk-kicker">BINANCE MARKET SAFETY</span>
            <h2>⚠️ Binance Risk Watch</h2>
            <p>Monitoring tags, official delisting notices and the latest Binance Spot news in one place.</p>
          </div>
          <div className="risk-actions">
            <div className="risk-refresh">
              <span className="risk-live-dot"></span>
              <strong>Auto Refresh: Every 1 Hour</strong>
              <small id="riskNextUpdate">Next update in 30m</small>
            </div>
          </div>
        </div>

        <div className="risk-summary">
          <div className="risk-stat monitoring"><span id="riskMonitoringCount">32</span><small>Monitoring Tags</small></div>
          <div className="risk-stat delisting"><span id="riskDelistingCount">10</span><small>Delisting Notices</small></div>
          <div className="risk-stat inactive"><span id="riskNewsCount">26</span><small>Binance Spot News</small></div>
          <div className="risk-stat updated"><span id="riskUpdatedTime">06:08 PM</span><small>Last Updated</small></div>
        </div>

        <div className="risk-grid">
          {/* Column 1: Monitoring Tags */}
          <section className="risk-panel">
            <div className="risk-panel-head">
              <div><span className="risk-panel-icon amber">M</span><h3>Monitoring Tag</h3></div>
              <span className="risk-note">Higher-risk assets</span>
            </div>
            <div id="riskMonitoring" className="risk-list" style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {monitoringCoins.map(coin => (
                <div
                  key={coin.symbol}
                  className="mover-row"
                  style={{ margin: '6px 0', padding: '10px 14px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', cursor: 'pointer' }} onClick={() => setSelectedChartCoin(coin.symbol)}>
                      {coin.symbol} ↗
                    </div>
                    <div
                      style={{ fontSize: '11px', color: '#58A6FF', cursor: 'pointer', marginTop: '2px' }}
                      onClick={() => setSelectedChartCoin(coin.symbol)}
                    >
                      Open TradingView · 1H
                    </div>
                  </div>
                  <span style={{ background: 'rgba(240,192,64,.15)', color: '#F0C040', border: '1px solid rgba(240,192,64,.4)', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 700 }}>
                    Monitoring
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Column 2: Delisting Notices */}
          <section className="risk-panel">
            <div className="risk-panel-head">
              <div><span className="risk-panel-icon red">D</span><h3>Upcoming Delisting Notices</h3></div>
              <span className="risk-note">Official Binance announcements</span>
            </div>
            <div id="riskDelistings" className="risk-list" style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {delistingNotices.map((n, i) => (
                <div
                  key={i}
                  style={{ margin: '6px 0', padding: '10px 14px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                      {n.date} · <a href="https://www.binance.com/en/support/announcement" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Open announcement ↗</a>
                    </div>
                  </div>
                  <span style={{ background: 'rgba(248,81,73,.15)', color: '#f85149', border: '1px solid rgba(248,81,73,.35)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                    {n.badge}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Column 3: Spot News */}
          <section className="risk-panel">
            <div className="risk-panel-head">
              <div><span className="risk-panel-icon blue">N</span><h3>Binance Spot News</h3></div>
              <span className="risk-note">Listings and Spot updates</span>
            </div>
            <div id="riskNews" className="risk-list" style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {spotNews.map((news, i) => (
                <div
                  key={i}
                  style={{ margin: '6px 0', padding: '10px 14px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                      {news.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                      {news.date} · <a href="https://www.binance.com/en/support/announcement" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Open announcement ↗</a>
                    </div>
                  </div>
                  <span style={{
                    background: news.cls === 'red' ? 'rgba(248,81,73,.15)' : news.cls === 'green' ? 'rgba(57,211,83,.15)' : 'rgba(88,166,255,.15)',
                    color: news.cls === 'red' ? '#f85149' : news.cls === 'green' ? '#39D353' : '#58A6FF',
                    border: `1px solid ${news.cls === 'red' ? 'rgba(248,81,73,.35)' : news.cls === 'green' ? 'rgba(57,211,83,.35)' : 'rgba(88,166,255,.35)'}`,
                    borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 700, flexShrink: 0
                  }}>
                    {news.badge}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="risk-footnote">
          Monitoring Tag is a risk warning, not confirmation of delisting. Always open the official Binance notice before making a decision.
        </div>
      </div>

      {selectedChartCoin && (
        <TradingViewModal
          symbol={selectedChartCoin}
          isOpen={true}
          onClose={() => setSelectedChartCoin(null)}
        />
      )}
    </div>
  );
};
