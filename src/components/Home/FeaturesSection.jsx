import React from 'react';
import { Truck, CreditCard, Headphones } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Truck size={48} strokeWidth={1.5} />,
      title: 'Free delivery from DHD199.99',
      description: 'Service available for the Morocco.'
    },
    {
      icon: <CreditCard size={48} strokeWidth={1.5} />,
      title: 'Secure Payment',
      description: 'All payments are made through a secure server. No bank details are stored and no one has access to them.'
    },
    {
      icon: <Headphones size={48} strokeWidth={1.5} />,
      title: 'Customer Service',
      description: 'A question? A problem? We are here for you and offer several ways to contact us.'
    }
  ];

  return (
    <div style={styles.container}>
      {features.map((feature, index) => (
        <div key={index} style={styles.card}>
          <div style={styles.iconWrapper}>
            {feature.icon}
          </div>
          <h3 style={styles.title}>{feature.title}</h3>
          <p style={styles.description}>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: '60px',
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    flexWrap: 'wrap'
  },
  card: {
    flex: '1',
    minWidth: '280px',
    maxWidth: '350px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px'
  },
  iconWrapper: {
    marginBottom: '20px',
    color: '#000'
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#000',
    lineHeight: '1.3',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  description: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#333',
    margin: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};