# Tap2Go Documentation

Welcome to the Tap2Go food delivery platform documentation. This directory contains comprehensive guides and references for developers working on the platform.

## 📊 ECharts Implementation

Our charting and analytics implementation follows a strategic **90/10 rule** approach:

### 📋 Documentation Files

1. **[ECharts Implementation Guide](./ECHARTS_IMPLEMENTATION_GUIDE.md)**
   - Comprehensive guide covering our 90/10 strategy
   - Detailed implementation examples
   - Best practices and performance guidelines
   - Do's and Don'ts for both approaches

2. **[ECharts Quick Reference](./ECHARTS_QUICK_REFERENCE.md)**
   - Quick decision guide for developers
   - Code snippets and examples
   - Common troubleshooting tips
   - Cheat sheet for daily development

### 🎯 90/10 Rule Summary

- **90% of charts**: Use `echarts-for-react` with our `BaseChart` component
  - Standard business charts (bar, line, pie, area)
  - Dashboard analytics for all panels
  - Quick implementation and development
  - React-friendly patterns

- **10% of charts**: Use direct `echarts` implementation
  - Real-time data streaming and updates
  - Complex custom interactions
  - Performance-critical scenarios
  - Advanced chart types and features

### 🚀 Quick Start

```typescript
// 90% Use Case - Standard Chart
import BaseChart from '@/components/analytics/BaseChart';

const MyChart = ({ data }) => (
  <BaseChart 
    option={{ /* ECharts option */ }} 
    config={{ title: 'My Chart', height: 400 }}
  />
);

// 10% Use Case - Advanced Chart
import { DirectChart } from '@/components/analytics/DirectECharts';

const MyAdvancedChart = () => (
  <DirectChart 
    option={{ /* ECharts option */ }}
    onChartReady={(chart) => { /* Custom handling */ }}
  />
);
```

### 🎨 Brand Guidelines

All charts should use Tap2Go brand colors:
- Primary: `#f3a823` (Orange)
- Secondary: `#ef7b06` (Darker Orange)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Yellow)
- Error: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

### 📱 Panel Coverage

Our analytics implementation covers:
- **Admin Panel**: Revenue analytics, real-time monitoring, geographic insights
- **Vendor Panel**: Sales reports, menu performance, order management
- **Driver Panel**: Earnings tracking, route optimization, performance metrics
- **Customer App**: Order history, preferences, live tracking

### 🔗 Live Demo

Visit `/analytics-demo` to see both approaches in action:
- Side-by-side comparison of React wrapper vs Direct ECharts
- Real working examples for all panel types
- Performance demonstrations
- Interactive features showcase

### 📚 Additional Resources

- **Component Files**:
  - `src/components/analytics/BaseChart.tsx` - React wrapper implementation
  - `src/components/analytics/DirectECharts.tsx` - Direct ECharts implementation
  - `src/components/analytics/types.ts` - TypeScript interfaces

- **Example Implementations**:
  - `src/components/analytics/admin/` - Admin panel charts
  - `src/components/analytics/vendor/` - Vendor panel charts
  - `src/components/analytics/driver/` - Driver panel charts
  - `src/components/analytics/customer/` - Customer app charts

### 🤝 Contributing

When contributing to the analytics system:

1. **Follow the 90/10 rule** - Start with BaseChart unless you have specific needs
2. **Use TypeScript** - All chart implementations must be properly typed
3. **Test responsiveness** - Ensure charts work on mobile and desktop
4. **Document decisions** - Explain why you chose Direct ECharts (10% cases)
5. **Review performance** - Monitor chart performance in development

### 📞 Support

For questions about ECharts implementation:
1. Check the [Implementation Guide](./ECHARTS_IMPLEMENTATION_GUIDE.md)
2. Refer to the [Quick Reference](./ECHARTS_QUICK_REFERENCE.md)
3. Review the live demo at `/analytics-demo`
4. Consult with senior developers for Direct ECharts use cases

---

**Platform**: Tap2Go Food Delivery  
**Technology Stack**: Next.js, TypeScript, ECharts, Tailwind CSS  
**Last Updated**: December 2024
