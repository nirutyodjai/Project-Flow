
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const teamMembers = [
  { name: 'Thanapon', initials: 'T', bgColor: 'from-blue-500 to-blue-700' },
  { name: 'Somchai', initials: 'S', bgColor: 'from-green-500 to-green-700' },
  { name: 'Naree', initials: 'N', bgColor: 'from-purple-500 to-purple-700' },
  { name: 'Peter', initials: 'P', bgColor: 'from-red-500 to-red-700' },
  { name: 'Anna', initials: 'A', bgColor: 'from-yellow-500 to-yellow-700' },
];

export const TeamMembersCard = () => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center space-y-2">
              <Avatar className="h-12 w-12">
                <div className={cn('flex h-full w-full items-center justify-center rounded-full text-white', member.bgColor)}>
                  {member.initials}
                </div>
              </Avatar>
              <span className="text-xs text-muted-foreground">{member.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
