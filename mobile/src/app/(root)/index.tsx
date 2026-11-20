import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SignOutButton } from '@/components/SignOutButton'
import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';

const index = () => {
   const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  if(!user){
    return null
  }
  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(
    user.id
  );
  console.log(user.id)

  console.log(transactions, summary)
  return (
    <View>
        <SignOutButton/>
      <Text>index</Text>
    </View>
  )
}

export default index