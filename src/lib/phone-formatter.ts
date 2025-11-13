/**
 * 전화번호 자동 포맷팅 유틸리티
 * 숫자만 입력받아 자동으로 하이픈을 추가합니다.
 */

export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');
  
  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else {
    // 11자리 초과시 11자리까지만 포맷팅
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

export const validatePhoneNumber = (value: string): boolean => {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

export const getPhoneNumberPlaceholder = (): string => {
  return '010-1234-5678';
};