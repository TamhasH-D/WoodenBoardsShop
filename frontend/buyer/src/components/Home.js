import React from 'react';
import { BUYER_TEXTS } from '../utils/localization';
import FeaturedProducts from './home/FeaturedProducts';


function Home() {

  return (
    <div>
      {/* Hero Section */}
      <div className="header">
        <div className="container">
          <h1>{BUYER_TEXTS.WELCOME_TITLE}</h1>
          <p>{BUYER_TEXTS.WELCOME_SUBTITLE}</p>
          <div className="flex gap-4 mt-6">
            <a href="/products" className="btn btn-primary">
              {BUYER_TEXTS.BROWSE_PRODUCTS}
            </a>
            <a href="/analyzer" className="btn btn-secondary">
              {BUYER_TEXTS.ANALYZE_WOOD_BOARD}
            </a>
          </div>
        </div>
      </div>

      {/* Рекомендуемые товары */}
      <FeaturedProducts
        title="Рекомендуемые товары"
        subtitle="Качественная древесина от проверенных поставщиков"
        limit={6}
        variant="hero"
      />

      <div className="container">



        {/* Getting Started */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{BUYER_TEXTS.GETTING_STARTED}</h2>
          </div>
          <div className="grid grid-auto">
            <div>
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.FOR_BUYERS}</h3>
              <ol style={{ marginLeft: '1.5rem' }}>
                <li>{BUYER_TEXTS.BROWSE_AVAILABLE_PRODUCTS}</li>
                <li>{BUYER_TEXTS.USE_BOARD_ANALYZER}</li>
                <li>{BUYER_TEXTS.CONTACT_SELLERS_CHAT}</li>
                <li>{BUYER_TEXTS.NEGOTIATE_PRICES_DELIVERY}</li>
              </ol>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.FEATURES_AVAILABLE}</h3>
              <ul style={{ marginLeft: '1.5rem' }}>
                <li>{BUYER_TEXTS.PRODUCT_SEARCH_FILTERING}</li>
                <li>{BUYER_TEXTS.SELLER_PROFILES_RATINGS}</li>
                <li>{BUYER_TEXTS.AI_POWERED_BOARD_ANALYSIS}</li>
                <li>{BUYER_TEXTS.REAL_TIME_CHAT_SYSTEM}</li>
                <li>{BUYER_TEXTS.PRICE_COMPARISON_TOOLS}</li>
              </ul>
            </div>
          </div>
        </div>


      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }

        .grid {
          display: grid;
          gap: 1.5rem;
        }

        .grid-auto {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .grid-auto-sm {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        @media (max-width: 768px) {
          .grid-auto {
            grid-template-columns: 1fr;
          }
          .grid-auto-sm {
            grid-template-columns: 1fr;
          }
          .product-card {
            margin: 0 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 0.75rem;
          }
          .product-card {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
