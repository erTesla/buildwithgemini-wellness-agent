import React from 'react';
import { HobbyItem, UserPreferences, ActivityRecommendation } from '../types';
import { ActivitiesScreen } from './ActivitiesScreen';

interface HobbiesScreenProps {
  userId: string;
  hobbies: HobbyItem[];
  preferences: UserPreferences;
  recommendations?: ActivityRecommendation[];
  onSaveHobby: (hobby: HobbyItem) => Promise<void>;
  onDeleteHobby: (hobbyId: string) => Promise<void>;
  onSaveAsTask?: (rec: ActivityRecommendation) => Promise<void>;
  onSaveFeedback?: (recId: string, feedback: 'tried_loved' | 'dismissed') => void;
}

export const HobbiesScreen: React.FC<HobbiesScreenProps> = (props) => {
  return (
    <ActivitiesScreen
      userId={props.userId}
      hobbies={props.hobbies}
      preferences={props.preferences}
      recommendations={props.recommendations}
      onSaveHobby={props.onSaveHobby}
      onDeleteHobby={props.onDeleteHobby}
      onSaveAsTask={props.onSaveAsTask || (async () => {})}
      onSaveFeedback={props.onSaveFeedback}
      initialTab="my_hobbies"
    />
  );
};
