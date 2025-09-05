import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { ACCESSIBILITY_CONSTANTS } from '../constants/accessibility';

interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  component?: string;
  fix?: string;
}

export class AccessibilityTester {
  private static results: AccessibilityTestResult[] = [];

  /**
   * Test if element has proper accessibility label
   */
  static testAccessibilityLabel(
    element: any,
    componentName: string,
    expectedLabel?: string
  ): AccessibilityTestResult {
    const hasLabel = element.props?.accessibilityLabel;
    const hasRole = element.props?.accessibilityRole;

    if (!hasLabel) {
      return {
        passed: false,
        severity: 'error',
        component: componentName,
        message: `Missing accessibilityLabel in ${componentName}`,
        fix: 'Add accessibilityLabel prop to describe what this element does',
      };
    }

    if (!hasRole) {
      return {
        passed: false,
        severity: 'warning',
        component: componentName,
        message: `Missing accessibilityRole in ${componentName}`,
        fix: 'Add accessibilityRole prop (button, text, image, etc.)',
      };
    }

    if (expectedLabel && element.props.accessibilityLabel !== expectedLabel) {
      return {
        passed: false,
        severity: 'warning',
        component: componentName,
        message: `Accessibility label mismatch in ${componentName}`,
        fix: `Expected "${expectedLabel}", got "${element.props.accessibilityLabel}"`,
      };
    }

    return {
      passed: true,
      severity: 'info',
      component: componentName,
      message: `Accessibility label properly set in ${componentName}`,
    };
  }

  /**
   * Test if touch target meets minimum size requirements
   */
  static testTouchTargetSize(
    width: number,
    height: number,
    componentName: string
  ): AccessibilityTestResult {
    const minSize = ACCESSIBILITY_CONSTANTS.TOUCH_TARGETS.MINIMUM;

    if (width < minSize || height < minSize) {
      return {
        passed: false,
        severity: 'error',
        component: componentName,
        message: `Touch target too small in ${componentName}: ${width}x${height}`,
        fix: `Increase size to at least ${minSize}x${minSize}dp`,
      };
    }

    const recommendedSize = ACCESSIBILITY_CONSTANTS.TOUCH_TARGETS.RECOMMENDED;
    if (width < recommendedSize || height < recommendedSize) {
      return {
        passed: true, // Passed minimum, but warning for recommended
        severity: 'warning',
        component: componentName,
        message: `Touch target below recommended size in ${componentName}`,
        fix: `Consider increasing to ${recommendedSize}x${recommendedSize}dp for better usability`,
      };
    }

    return {
      passed: true,
      severity: 'info',
      component: componentName,
      message: `Touch target size appropriate in ${componentName}`,
    };
  }

  /**
   * Test color contrast (simplified version)
   */
  static testColorContrast(
    foregroundColor: string,
    backgroundColor: string,
    componentName: string
  ): AccessibilityTestResult {
    // This is a simplified test - in production you'd use a proper color contrast calculator
    const contrastPairs = [
      { fg: '#FFFFFF', bg: '#000000', ratio: 21 },  // White on black
      { fg: '#000000', bg: '#FFFFFF', ratio: 21 },  // Black on white
      { fg: '#FFFF00', bg: '#000000', ratio: 19.6 }, // Yellow on black
      { fg: '#212121', bg: '#FFFFFF', ratio: 12.6 }, // Dark gray on white
    ];

    const pair = contrastPairs.find(p =>
      p.fg.toLowerCase() === foregroundColor.toLowerCase() &&
      p.bg.toLowerCase() === backgroundColor.toLowerCase()
    );

    if (pair && pair.ratio >= 4.5) {
      return {
        passed: true,
        severity: 'info',
        component: componentName,
        message: `Color contrast meets WCAG AA standards in ${componentName} (${pair.ratio}:1)`,
      };
    }

    return {
      passed: false,
      severity: 'error',
      component: componentName,
      message: `Color contrast may not meet WCAG AA standards in ${componentName}`,
      fix: 'Ensure contrast ratio is at least 4.5:1 for normal text, 3:1 for large text',
    };
  }

  /**
   * Test if interactive element has proper states
   */
  static testInteractiveElement(
    element: any,
    componentName: string
  ): AccessibilityTestResult {
    const isButton = element.props?.accessibilityRole === 'button';
    const hasOnPress = element.props?.onPress;
    const hasAccessibilityState = element.props?.accessibilityState;

    if (isButton && !hasOnPress) {
      return {
        passed: false,
        severity: 'error',
        component: componentName,
        message: `Button without onPress handler in ${componentName}`,
        fix: 'Add onPress handler or change accessibility role',
      };
    }

    if (isButton && !hasAccessibilityState) {
      return {
        passed: false,
        severity: 'warning',
        component: componentName,
        message: `Button without accessibility state in ${componentName}`,
        fix: 'Add accessibilityState prop to indicate disabled/selected state',
      };
    }

    return {
      passed: true,
      severity: 'info',
      component: componentName,
      message: `Interactive element properly configured in ${componentName}`,
    };
  }

  /**
   * Test form input accessibility
   */
  static testFormInput(
    element: any,
    componentName: string
  ): AccessibilityTestResult {
    const hasLabel = element.props?.accessibilityLabel;
    const hasHint = element.props?.accessibilityHint;
    const hasValue = element.props?.accessibilityValue;
    const hasReturnKeyType = element.props?.returnKeyType;

    const issues = [];

    if (!hasLabel) {
      issues.push('Missing accessibilityLabel');
    }

    if (!hasHint) {
      issues.push('Missing accessibilityHint');
    }

    if (!hasReturnKeyType) {
      issues.push('Missing returnKeyType for keyboard navigation');
    }

    if (issues.length > 0) {
      return {
        passed: false,
        severity: 'warning',
        component: componentName,
        message: `Form input accessibility issues in ${componentName}: ${issues.join(', ')}`,
        fix: 'Add missing accessibility props for better screen reader support',
      };
    }

    return {
      passed: true,
      severity: 'info',
      component: componentName,
      message: `Form input properly configured in ${componentName}`,
    };
  }

  /**
   * Run comprehensive accessibility test suite
   */
  static runTestSuite(components: Array<{ element: any, name: string, type: string }>) {
    this.results = [];

    components.forEach(({ element, name, type }) => {
      // Test accessibility label
      this.results.push(this.testAccessibilityLabel(element, name));

      // Test touch targets for interactive elements
      if (type === 'button' || type === 'touchable') {
        const width = element.props?.style?.width || 48;
        const height = element.props?.style?.height || 48;
        this.results.push(this.testTouchTargetSize(width, height, name));
      }

      // Test interactive elements
      if (type === 'button' || type === 'touchable') {
        this.results.push(this.testInteractiveElement(element, name));
      }

      // Test form inputs
      if (type === 'input' || type === 'textInput') {
        this.results.push(this.testFormInput(element, name));
      }

      // Test color contrast (if style colors are provided)
      if (element.props?.style?.color && element.props?.style?.backgroundColor) {
        this.results.push(this.testColorContrast(
          element.props.style.color,
          element.props.style.backgroundColor,
          name
        ));
      }
    });

    return this.results;
  }

  /**
   * Generate accessibility report
   */
  static generateReport(): string {
    const errors = this.results.filter(r => r.severity === 'error' && !r.passed);
    const warnings = this.results.filter(r => r.severity === 'warning' && !r.passed);
    const passed = this.results.filter(r => r.passed);

    let report = '# Accessibility Test Report\n\n';

    report += '## Summary\n';
    report += `- ✅ Passed: ${passed.length}\n`;
    report += `- ⚠️ Warnings: ${warnings.length}\n`;
    report += `- ❌ Errors: ${errors.length}\n\n`;

    if (errors.length > 0) {
      report += '## 🚨 Critical Issues (Must Fix)\n';
      errors.forEach((error, index) => {
        report += `${index + 1}. **${error.component}**: ${error.message}\n`;
        if (error.fix) {
          report += `   - Fix: ${error.fix}\n`;
        }
        report += '\n';
      });
    }

    if (warnings.length > 0) {
      report += '## ⚠️ Warnings (Should Fix)\n';
      warnings.forEach((warning, index) => {
        report += `${index + 1}. **${warning.component}**: ${warning.message}\n`;
        if (warning.fix) {
          report += `   - Fix: ${warning.fix}\n`;
        }
        report += '\n';
      });
    }

    if (passed.length > 0) {
      report += '## ✅ Passed Tests\n';
      const passedByComponent = passed.reduce((acc, p) => {
        acc[p.component || 'Unknown'] = (acc[p.component || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(passedByComponent).forEach(([component, count]) => {
        report += `- ${component}: ${count} tests passed\n`;
      });
    }

    report += '\n## Recommendations\n';
    report += '- Ensure all interactive elements have accessibilityLabel and accessibilityRole\n';
    report += '- Test with actual screen reader (TalkBack/VoiceOver)\n';
    report += '- Verify color contrast ratios meet WCAG AA standards\n';
    report += '- Test keyboard navigation flow\n';

    return report;
  }

  /**
   * Get test results
   */
  static getResults(): AccessibilityTestResult[] {
    return this.results;
  }

  /**
   * Clear test results
   */
  static clearResults(): void {
    this.results = [];
  }
}

/**
 * Quick accessibility check function for development
 */
export const quickAccessibilityCheck = (element: any, componentName: string) => {
  const issues = [];

  if (!element.props?.accessibilityLabel) {
    issues.push(`❌ Missing accessibilityLabel in ${componentName}`);
  }

  if (!element.props?.accessibilityRole && element.props?.onPress) {
    issues.push(`⚠️ Missing accessibilityRole in interactive ${componentName}`);
  }

  if (element.props?.style?.width && element.props.style.width < 44) {
    issues.push(`❌ Touch target too small in ${componentName} (${element.props.style.width}dp)`);
  }

  if (issues.length === 0) {
    console.log(`✅ ${componentName} accessibility check passed`);
  } else {
    console.log(`🔍 Accessibility issues in ${componentName}:`);
    issues.forEach(issue => console.log(`  ${issue}`));
  }

  return issues;
};

export default AccessibilityTester;
