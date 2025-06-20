/**
 * Base Email Template for Tap2Go
 * Professional email layout with consistent branding
 */

import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  previewText?: string;
  title?: string;
}

export const BaseEmailTemplate: React.FC<BaseEmailTemplateProps> = ({
  children,
  previewText = 'Tap2Go - Your Food Delivery Partner',
  title = 'Tap2Go'
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tap2go.com';
  
  return (
    <Html>
      <Head>
        <title>{title}</title>
        <meta name="description" content={previewText} />
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src={`${baseUrl}/logo-email.png`}
                  width="120"
                  height="40"
                  alt="Tap2Go"
                  style={logo}
                />
              </Column>
              <Column align="right">
                <Text style={headerText}>Food Delivery</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children as any}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Row>
              <Column>
                <Text style={footerText}>
                  © 2024 Tap2Go. All rights reserved.
                </Text>
                <Text style={footerText}>
                  Questions? Contact us at{' '}
                  <Link href="mailto:support@tap2go.com" style={link}>
                    support@tap2go.com
                  </Link>
                </Text>
              </Column>
            </Row>
            
            <Row style={socialRow}>
              <Column align="center">
                <Link href={`${baseUrl}/unsubscribe`} style={unsubscribeLink}>
                  Unsubscribe
                </Link>
                {' | '}
                <Link href={`${baseUrl}/privacy`} style={unsubscribeLink}>
                  Privacy Policy
                </Link>
                {' | '}
                <Link href={`${baseUrl}/terms`} style={unsubscribeLink}>
                  Terms of Service
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e6ebf1',
};

const logo = {
  margin: '0',
};

const headerText = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0',
  lineHeight: '40px',
};

const content = {
  padding: '30px 30px 40px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 30px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px 0',
};

const socialRow = {
  marginTop: '20px',
};

const link = {
  color: '#f97316',
  textDecoration: 'none',
};

const unsubscribeLink = {
  color: '#8898aa',
  fontSize: '12px',
  textDecoration: 'none',
};

export default BaseEmailTemplate;
