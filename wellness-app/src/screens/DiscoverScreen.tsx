import React from 'react';
import { ActivityRecommendation, UserPreferences, HobbyItem } from '../types';
import { ActivitiesScreen } from './ActivitiesScreen';

interface DiscoverScreenProps {
  userId: string;
  preferences: UserPreferences;
  recommendations: ActivityRecommendation[];
  hobbies?: HobbyItem[];
  onSaveHobby?: (hobby: HobbyItem) => Promise<void>;
  onDeleteHobby?: (hobbyId: string) => Promise<void>;
  onSaveAsTask: (rec: ActivityRecommendation) => Promise<void>;
  onSaveFeedback: (recId: string, feedback: 'tried_loved' | 'dismissed') => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = (props) => {
  return (
    <ActivitiesScreen
      userId={props.userId}
      hobbies={props.hobbies || []}
      preferences={props.preferences}
      recommendations={props.recommendations}
      onSaveHobby={props.onSaveHobby || (async () => {})}
      onDeleteHobby={props.onDeleteHobby || (async () => {})}
      onSaveAsTask={props.onSaveAsTask}
      onSaveFeedback={props.onSaveFeedback}
      initialTab="explore"
    />
  );
};
