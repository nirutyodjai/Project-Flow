'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle, Calendar } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  label?: string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean; // น้อยกว่า 7 วัน
  isCritical: boolean; // น้อยกว่า 3 วัน
}

export function CountdownTimer({ deadline, label = "ครบกำหนด", className = "" }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false,
    isCritical: false
  });

  const calculateTimeRemaining = (deadlineDate: Date): TimeRemaining => {
    const now = new Date();
    const difference = deadlineDate.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        isUrgent: false,
        isCritical: false
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      isUrgent: days <= 7 && days > 3,
      isCritical: days <= 3
    };
  };

  useEffect(() => {
    const deadlineDate = new Date(deadline);
    
    // อัพเดตทุกวินาที
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadlineDate));
    }, 1000);

    // คำนวณครั้งแรก
    setTimeRemaining(calculateTimeRemaining(deadlineDate));

    return () => clearInterval(timer);
  }, [deadline]);

  const getStatusColor = () => {
    if (timeRemaining.isExpired) return "bg-gray-500";
    if (timeRemaining.isCritical) return "bg-red-600";
    if (timeRemaining.isUrgent) return "bg-orange-500";
    return "bg-green-600";
  };

  const getStatusText = () => {
    if (timeRemaining.isExpired) return "หมดเวลา";
    if (timeRemaining.isCritical) return "เร่งด่วน";
    if (timeRemaining.isUrgent) return "ใกล้ครบกำหนด";
    return "ปกติ";
  };

  const getIcon = () => {
    if (timeRemaining.isExpired) return <Clock className="h-4 w-4" />;
    if (timeRemaining.isCritical) return <AlertTriangle className="h-4 w-4" />;
    if (timeRemaining.isUrgent) return <Clock className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* วันที่ครบกำหนด */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4" />
        <span>{label}: {formatDate(deadline)}</span>
      </div>

      {/* Countdown Timer */}
      <Card className={`border-l-4 ${timeRemaining.isCritical ? 'border-red-500' : timeRemaining.isUrgent ? 'border-orange-500' : 'border-green-500'}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon()}
              <span className="text-sm font-medium">เวลาที่เหลือ</span>
            </div>
            <Badge variant="secondary" className={`${getStatusColor()} text-white`}>
              {getStatusText()}
            </Badge>
          </div>

          {!timeRemaining.isExpired ? (
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50 rounded p-2">
                <div className={`text-lg font-bold ${timeRemaining.isCritical ? 'text-red-600' : timeRemaining.isUrgent ? 'text-orange-500' : 'text-green-600'}`}>
                  {timeRemaining.days}
                </div>
                <div className="text-xs text-gray-500">วัน</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className={`text-lg font-bold ${timeRemaining.isCritical ? 'text-red-600' : timeRemaining.isUrgent ? 'text-orange-500' : 'text-green-600'}`}>
                  {timeRemaining.hours}
                </div>
                <div className="text-xs text-gray-500">ชม.</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className={`text-lg font-bold ${timeRemaining.isCritical ? 'text-red-600' : timeRemaining.isUrgent ? 'text-orange-500' : 'text-green-600'}`}>
                  {timeRemaining.minutes}
                </div>
                <div className="text-xs text-gray-500">นาที</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className={`text-lg font-bold ${timeRemaining.isCritical ? 'text-red-600' : timeRemaining.isUrgent ? 'text-orange-500' : 'text-green-600'}`}>
                  {timeRemaining.seconds}
                </div>
                <div className="text-xs text-gray-500">วิ.</div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-center">
              <div className="text-lg font-bold text-gray-500">
                หมดเวลายื่นซองแล้ว
              </div>
            </div>
          )}

          {/* ข้อความเตือน */}
          {timeRemaining.isCritical && !timeRemaining.isExpired && (
            <div className="mt-2 text-center">
              <div className="text-xs text-red-600 font-medium animate-pulse">
                ⚠️ เหลือเวลาน้อยกว่า 3 วัน - เร่งดำเนินการ!
              </div>
            </div>
          )}
          {timeRemaining.isUrgent && !timeRemaining.isCritical && (
            <div className="mt-2 text-center">
              <div className="text-xs text-orange-600 font-medium">
                🕒 เหลือเวลาไม่ถึง 1 สัปดาห์
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook สำหรับใช้ Countdown Timer
export function useCountdown(deadline: string) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false,
    isCritical: false
  });

  useEffect(() => {
    const deadlineDate = new Date(deadline);
    
    const calculateTime = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isUrgent: false,
          isCritical: false
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isUrgent: days <= 7 && days > 3,
        isCritical: days <= 3
      };
    };

    const timer = setInterval(() => {
      setTimeRemaining(calculateTime());
    }, 1000);

    setTimeRemaining(calculateTime());

    return () => clearInterval(timer);
  }, [deadline]);

  return timeRemaining;
}
